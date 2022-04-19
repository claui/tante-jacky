from ctypes import CDLL, CFUNCTYPE, POINTER, c_char_p, c_int, c_void_p
from ctypes.util import find_library

_gwenhywfar = CDLL(find_library('gwenhywfar'))

_prototype = CFUNCTYPE(c_void_p, c_char_p)
GWEN_PluginManager_FindPluginManager = \
    _prototype(
        ('GWEN_PluginManager_FindPluginManager', _gwenhywfar),
        ((1,),)
    )

_prototype = CFUNCTYPE(c_void_p, c_void_p, c_char_p)
GWEN_PluginManager_GetPlugin = \
    _prototype(
        ('GWEN_PluginManager_GetPlugin', _gwenhywfar),
        ((1, 'plugin_manager'), (1, 'name'))
    )

_prototype = CFUNCTYPE(c_void_p, c_void_p)
GWEN_Plugin_GetLibLoader = \
    _prototype(
        ('GWEN_Plugin_GetLibLoader', _gwenhywfar),
        ((1,),)
    )

_prototype = CFUNCTYPE(c_int, c_void_p, c_char_p, POINTER(c_void_p))
GWEN_LibLoader_Resolve = \
    _prototype(
        ('GWEN_LibLoader_Resolve', _gwenhywfar),
        ((1, 'loader'), (1, 'symbol'), (2,))
    )
