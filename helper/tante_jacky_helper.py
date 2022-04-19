#!/usr/bin/env python3

"""Backend helper script for Tante Jacky"""

from binascii import unhexlify
from ctypes import byref, c_int, c_ubyte, create_string_buffer
import os

from gwenhywfar.plugins.chiptanusb import \
    GetTanfromUSB_Generator

MAX_NUM_DATA_ELEMENTS_V13X = 3
LENGTH_BITMASK_V13X = 0b00001111
ENCODING_BITMASK_V13X = 0b00010000
ENCODING_SHIFT_V13X = 4
ALLZERO_BITMASK_V13X = ((1 << 8) - 1) \
    & ~(LENGTH_BITMASK_V13X | ENCODING_BITMASK_V13X)


def _assert_size(subject, expected=None):
    actual = len(subject)
    if not expected:
        raise ValueError('Missing `expected`')
    if expected == actual:
        return
    raise RuntimeError(
        (
            'Size mismatch; expected length: {expected} bytes; '
            + 'actual length: {actual} bytes; '
            + 'string under test: {subject}'
        ).format(subject=subject, expected=expected, actual=actual)
    )


def _assert_all_zero(value, described_as=None, bits=None):
    all_zero_part = value & bits
    if not all_zero_part:
        return
    raise ValueError(
        f'expected bits (mask {ALLZERO_BITMASK_V13X:#08b})'
        + f' of {described_as} value ({value:#02x}) to be zero'
        + f' but found {all_zero_part:#08b}')


def _parse_element_v13x(length_bytes=None,
                        element=None,
                        element_key=None,
                        element_described_as=None,
                        is_ascii_payload=False):
    element_length = 2 * length_bytes
    value = unhexlify(element[:element_length]) \
        if is_ascii_payload \
        else element[:element_length]

    if len(value) < length_bytes:
        raise ValueError(
            f'{element_described_as}: expected payload of length'
            + f' {length_bytes} bytes but found shorter payload:'
            + f' {value}')

    return element_key, {
        'name': element_described_as,
        'format': 'ASCII' if is_ascii_payload else 'BCD',
        'byte_length': length_bytes,
        'value': value,
    }


def _parse_elements_v13x(data_elements_hex):
    remainder_hex = data_elements_hex

    def _start_code_section():
        nonlocal remainder_hex

        ls_value = int(remainder_hex[:2], base=16)
        _assert_all_zero(ls_value, described_as='LS',
                         bits=ALLZERO_BITMASK_V13X)
        remainder_hex = remainder_hex[2:]

        yield _parse_element_v13x(
            length_bytes=ls_value & LENGTH_BITMASK_V13X,
            element=remainder_hex,
            element_key='start_code',
            element_described_as='Start-Code',
            is_ascii_payload=(ls_value & ENCODING_BITMASK_V13X)
            >> ENCODING_SHIFT_V13X,
        )
        remainder_hex = \
            remainder_hex[2 * (ls_value & LENGTH_BITMASK_V13X):]

    def _data_elements_sections():
        yield from ()
        nonlocal remainder_hex

        for index in range(MAX_NUM_DATA_ELEMENTS_V13X):
            if not remainder_hex:
                break

            lde = int(remainder_hex[:2], base=16)
            _assert_all_zero(lde, described_as=f'LDE{index + 1}',
                             bits=ALLZERO_BITMASK_V13X)
            remainder_hex = remainder_hex[2:]
            yield _parse_element_v13x(
                length_bytes=lde & LENGTH_BITMASK_V13X,
                element=remainder_hex,
                element_key=f'de{index + 1}',
                element_described_as=f'Daten-Element {index + 1}',
                is_ascii_payload=(lde & ENCODING_BITMASK_V13X)
                >> ENCODING_SHIFT_V13X,
            )
            remainder_hex = \
                remainder_hex[2 * (lde & LENGTH_BITMASK_V13X):]

        if len(remainder_hex) > 0:
            raise ValueError(
                f'Up to {MAX_NUM_DATA_ELEMENTS_V13X} elements are allowed but'
                + f' found more; extraneous part: {unhexlify(remainder_hex)}')

    yield from _start_code_section()
    yield from _data_elements_sections()


def _translate_hhd_v13x(hhd_tan_challenge_hex):
    def generate(hhd_hex):
        pos = 0

        lc_value = int(hhd_hex[pos:pos + 2], base=16)
        yield 'lc', lc_value
        pos += 2

        _assert_size(unhexlify(hhd_hex[pos:]), expected=lc_value)
        cb_pos = len(hhd_hex) - 2
        if cb_pos < 0:
            raise ValueError(
                f'cb_pos expected to be non-negative but found {cb_pos}')
        yield from _parse_elements_v13x(hhd_hex[pos:cb_pos])

        yield 'cb', int(hhd_hex[cb_pos:], base=16)

    return dict(generate(hhd_tan_challenge_hex))


HHD_CHALLENGE_HEX = b'11048810123405000123456714312C3233FF'

# hhd_challenge = _translate_hhd_v13x(HHD_CHALLENGE_HEX)

hhd_challenge = unhexlify(HHD_CHALLENGE_HEX)

USB_CARD_PRELUDE = b'\0\0\0\0\1\0\0\0'
# usb_card_payload = USB_CARD_PRELUDE + hhd_challenge
usb_card_payload = hhd_challenge

atc = c_int()
tan = create_string_buffer(16)
card_number = create_string_buffer(11)
end_date = create_string_buffer(5)
issue_date = create_string_buffer(7)

os.environ['LC_LOGLEVEL'] = 'debug'

GetTanfromUSB_Generator(
    (c_ubyte * len(usb_card_payload))(*usb_card_payload),
    len(usb_card_payload),
    byref(atc),
    tan,
    len(tan),
    card_number,
    end_date,
    issue_date,
)

# https://github.com/aqbanking/libchipcard/blob/4e389464c30c0e2fc098a08b0971a7ee0bb4c946/src/ct/chiptanusb/chiptanusb.c#L211
