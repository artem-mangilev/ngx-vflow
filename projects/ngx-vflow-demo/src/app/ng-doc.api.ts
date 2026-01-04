import { NgDocApi } from '@ng-doc/core';

const Api: NgDocApi = {
  title: 'API Reference',
  scopes: [
    {
      name: 'ngx-vflow',
      route: 'ngx-vflow',
      include: 'projects/ngx-vflow-lib/src/public-api.ts',
    },
  ],
  order: 7,
};

export default Api;
