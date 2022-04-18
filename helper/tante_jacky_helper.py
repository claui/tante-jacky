#!/usr/bin/env python3

from binascii import unhexlify

MAX_NUM_DATA_ELEMENTS_V13X = 3
LENGTH_BITMASK_V13X = 0b00001111
ENCODING_BITMASK_V13X = 0b00010000
ENCODING_SHIFT_V13X = 4
ALLZERO_BITMASK_V13X = ((1 << 8) - 1) \
    & ~(LENGTH_BITMASK_V13X | ENCODING_BITMASK_V13X)


def _translate_hhd_13x(hhd_tan_challenge_hex):
    def assert_size(subject, expected=None):
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

    def data_elements(data_elements_hex):
        yield from ()
        remainder_hex = data_elements_hex

        ls_value = int(remainder_hex[:2], base=16)
        num_bytes = ls_value & LENGTH_BITMASK_V13X
        is_ascii_payload = (ls_value & ENCODING_BITMASK_V13X) \
            >> ENCODING_SHIFT_V13X

        all_zero_part = ls_value & ALLZERO_BITMASK_V13X
        if all_zero_part:
            raise ValueError(
                'LS: expected high bits'
                + f' (mask {ALLZERO_BITMASK_V13X:#08b}) of {ls_value:#02x}'
                + f' to be all zero but found {all_zero_part:#08b}')

        remainder_hex = remainder_hex[2:]
        if is_ascii_payload:
            value = unhexlify(remainder_hex[:2 * num_bytes])
        else:
            value = remainder_hex[:2 * num_bytes]
        remainder_hex = remainder_hex[2 * num_bytes:]

        if len(value) < num_bytes:
            raise ValueError(
                'Start-Code: expected payload of size'
                + f' {num_bytes} but found shorter payload: {value}')

        yield 'start_code', {
            'name': 'Start-Code',
            'format': 'ASCII' if is_ascii_payload else 'BCD',
            'byte_length': num_bytes,
            'value': value,
        }

        for index in range(MAX_NUM_DATA_ELEMENTS_V13X):
            if not remainder_hex:
                break

            lde = int(remainder_hex[:2], base=16)
            num_bytes = lde & LENGTH_BITMASK_V13X
            is_ascii_payload = (lde & ENCODING_BITMASK_V13X) \
                >> ENCODING_SHIFT_V13X

            all_zero_part = lde & ALLZERO_BITMASK_V13X
            if all_zero_part:
                raise ValueError(
                    f'LDE{index + 1}: expected high bits'
                    + f' (mask {ALLZERO_BITMASK_V13X:#08b}) of {lde:#02x}'
                    + f' to be all zero but found {all_zero_part:#08b}')

            remainder_hex = remainder_hex[2:]
            if is_ascii_payload:
                value = unhexlify(remainder_hex[:2 * num_bytes])
            else:
                value = remainder_hex[:2 * num_bytes]
            remainder_hex = remainder_hex[2 * num_bytes:]

            if len(value) < num_bytes:
                raise ValueError(
                    f'Daten-Element {index + 1}: expected payload of size'
                    + f' {num_bytes} but found shorter payload: {value}')

            yield f'de{index + 1}', {
                'name': f'Daten-Element {index + 1}',
                'format': 'ASCII' if is_ascii_payload else 'BCD',
                'byte_length': num_bytes,
                'value': value,
            }

        if len(remainder_hex) > 0:
            raise ValueError(
                f'Up to {MAX_NUM_DATA_ELEMENTS_V13X} elements are allowed but'
                + f' found more; extraneous part: {unhexlify(remainder_hex)}')

    def generate(hhd_hex):
        pos = 0

        lc_value = int(hhd_hex[pos:pos + 2], base=16)
        yield 'lc', lc_value
        pos += 2

        assert_size(unhexlify(hhd_hex[pos:]), expected=lc_value)
        cb_pos = len(hhd_hex) - 2
        if cb_pos < 0:
            raise ValueError(
                f'cb_pos expected to be non-negative but found {cb_pos}')
        yield from data_elements(hhd_hex[pos:cb_pos])

        yield 'cb', int(hhd_hex[cb_pos:], base=16)

    return dict(generate(hhd_tan_challenge_hex))


print(_translate_hhd_13x(b'11048810123405000123456714312C3233FF'))
