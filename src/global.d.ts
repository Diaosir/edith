interface Window {
  ppapp: object;
}

/**
 * 分享
 *
 * @author tdy
 * @interface ShareObj
 */
interface ShareObj {
  title: string;
  msg: string;
  url: string;
  imgurl: string;
  enable?: Array<string>;
  callback?: any;
}

/**
 * 神策
 *
 * @author tdy
 * @interface SAObj
 */
interface SAObj {
  title?: string;
  pageTitle?: string;
  URL?: string;
  errorMsg?: string;
  errorCode?: string;
  message?: string;
}
