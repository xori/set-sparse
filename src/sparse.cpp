#define UNICODE
#include <windows.h>
#include <node_api.h>

constexpr auto SYB_EXP_INVAL = "EINVAL";
constexpr auto SYB_ERR_WRONG_ARGUMENTS = "WRONG_ARGUMENTS";
constexpr auto SYB_ERR_NOT_A_CONSTRUCTOR = "THIS_FUNCTION_IS_NOT_A_CONSTRUCTOR";

namespace sparse {

bool set_sparse(const wchar_t *path, const bool create) {
  bool result = false;
  HANDLE hnd = CreateFileW(path, FILE_GENERIC_READ | GENERIC_WRITE, FILE_SHARE_READ, NULL, create ? OPEN_ALWAYS : OPEN_EXISTING, 0, NULL);
  if (hnd != INVALID_HANDLE_VALUE) {
    DWORD d;
    if (DeviceIoControl(hnd, FSCTL_SET_SPARSE, NULL, 0, NULL, 0, &d, NULL)) {
      result = true;
    }
    CloseHandle(hnd);
  }
  return result;
}


napi_value wrap_function(napi_env env, napi_callback_info info) {
  napi_value result;
  napi_get_new_target(env, info, &result);
  if (result) {
    result = NULL;
    napi_throw_error(env, SYB_EXP_INVAL, SYB_ERR_NOT_A_CONSTRUCTOR);
  } else {
    napi_value argv[2];
    size_t argc = 2;
    napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
    if (argc < 1) {
      napi_throw_error(env, SYB_EXP_INVAL, SYB_ERR_WRONG_ARGUMENTS);
    } else {
      size_t str_len;
      napi_value tmp;
      napi_coerce_to_string(env, argv[0], &tmp);
      napi_get_value_string_utf16(env, tmp, NULL, 0, &str_len);
      str_len += 1;
      wchar_t *path = (wchar_t*)malloc(sizeof(wchar_t) * str_len);
      napi_get_value_string_utf16(env, tmp, (char16_t*)path, str_len, NULL);
      bool create = false;
      if (argc > 1) {
        napi_coerce_to_bool(env, argv[1], &tmp);
        napi_get_value_bool(env, tmp, &create);
      }
      napi_get_boolean(env, set_sparse(path, create), &result);
      free(path);
    }
  }
  return result;
}


napi_value init(napi_env env, napi_value exports) {
  napi_value f;
  napi_create_function(env, NULL, 0, wrap_function, NULL, &f);
  napi_set_named_property(env, exports, "setSparse", f);

  return exports;
}


NAPI_MODULE(NODE_GYP_MODULE_NAME, init)

}
