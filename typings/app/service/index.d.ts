// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportGitlab from '../../../app/service/gitlab';
import ExportUser from '../../../app/service/user';

declare module 'egg' {
  interface IService {
    gitlab: ExportGitlab;
    user: ExportUser;
  }
}
