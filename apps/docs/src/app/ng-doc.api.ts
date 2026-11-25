import { NgDocApi } from '@ng-doc/core';

const Api: NgDocApi = {
  title: 'API Reference',
  scopes: [
    {
      name: 'ngx-vflow',
      route: 'ngx-vflow',
      include: 'libs/ngx-vflow/src/public-api.ts',
    },
  ],
  order: 9999,
};

export default Api;
