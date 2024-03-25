# {{ NgDocPage.title }}

`ngx-vflow` supports realtime sync validation of connections. Validation performs on user attempt to create new edge. By default, every connection is valid, but you can provide `ConnectionSettings` with `validatior` callback where you specify validation logic.

For example, in this case validation passes only connection from 1 to 2 node. If `validator` returns `false`, `(onConnect)` even won't be called because there is no valid connection.

{{ NgDocActions.demo("ConnectionValidationDemoComponent", { expanded: true }) }}
