from ctypes import CFUNCTYPE, POINTER, c_char_p, c_int, c_ubyte, \
    c_uint32, cast

from gwenhywfar.plugin import \
    GWEN_LibLoader_Resolve, \
    GWEN_Plugin_GetLibLoader, \
    GWEN_PluginManager_FindPluginManager, \
    GWEN_PluginManager_GetPlugin

_plugin_manager = GWEN_PluginManager_FindPluginManager(b'ct')

if not _plugin_manager:
    raise Exception('Plugin manager not found')

_plugin = GWEN_PluginManager_GetPlugin(_plugin_manager, name=b'chiptanusb')

if not _plugin:
    raise Exception('Plugin not found')

_loader = GWEN_Plugin_GetLibLoader(_plugin)

if not _loader:
    raise Exception('Library loader not found')

_prototype = CFUNCTYPE(
    c_int,              # return value
    POINTER(c_ubyte),   # unsigned char *HHDCommand
    c_int,              # int fullHHD_Len
    POINTER(c_int),     # int *pATC
    c_char_p,           # char *pGeneratedTAN
    c_uint32,           # uint32_t maxTanLen
    c_char_p,           # char *pCardnummber
    c_char_p,           # char *pEndDate
    c_char_p            # char *IssueDate
)
GetTanfromUSB_Generator = cast(
    GWEN_LibLoader_Resolve(_loader, symbol=b'GetTanfromUSB_Generator'),
    _prototype)

if not GetTanfromUSB_Generator:
    raise Exception('Unable to resolve symbol')
