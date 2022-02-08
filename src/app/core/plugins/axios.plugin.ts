import packageJson from '../../../../package.json';
import axios from 'axios';

import { LocalStorageItem, Workspace, AppPlugin } from '../../core/types';
import localStorageService from '../services/local-storage.service';
import { userThunks } from '../../store/slices/user';

const axiosPlugin: AppPlugin = {
  install(store): void {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;

    axios.interceptors.request.use((requestConfig) => {
      const tokenByWorkspace: { [key in Workspace]: string } = {
        [Workspace.Individuals]: localStorageService.get('xToken') || '',
        [Workspace.Business]: localStorageService.get('xTokenTeam') || '',
      };
      const mnemonicByWorkspace: { [key in Workspace]: string } = {
        [Workspace.Individuals]: localStorageService.get('xMnemonic') || '',
        [Workspace.Business]: localStorageService.getTeams()?.bridgeMnemonic || '',
      };
      const workspace =
        requestConfig.authWorkspace ||
        (localStorageService.get(LocalStorageItem.Workspace) as Workspace) ||
        Workspace.Individuals;

      requestConfig.headers = {
        'content-type': 'application/json; charset=utf-8',
        'internxt-version': packageJson.version,
        'internxt-client': 'drive-web',
        Authorization: `Bearer ${tokenByWorkspace[workspace]}`,
        'internxt-mnemonic': mnemonicByWorkspace[workspace],
        ...requestConfig.headers,
      };

      return requestConfig;
    });

    axios.interceptors.response.use(undefined, (err) => {
      if (err.response) {
        if (err.response.status === 401) {
          store.dispatch(userThunks.logoutThunk());
        }
      }

      return Promise.reject(err);
    });
  },
};

export default axiosPlugin;
