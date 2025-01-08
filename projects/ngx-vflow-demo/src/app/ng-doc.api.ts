import { NgDocApi } from '@ng-doc/core';

const Api: NgDocApi = {
  title: 'API',
  scopes: [
    {
      name: 'ngx-vflow',
      route: 'ngx-vflow',
      include: 'projects/ngx-vflow-lib/src/public-api.ts',
    },
  ],
  order: 3,
};

export default Api;
