# {{ NgDocPage.title }}

`ngx-vflow` supports real-time synchronous validation of connections. Validation occurs when a user attempts to create a new edge. By default, every connection is valid, but you can provide a `ConnectionSettings` with a `validatior` callback where you specify the validation logic.

For example, in this case, validation only passes connections from node 1 to node 2. If the `validator` returns `false`, the `(connect)` event won't be triggered because there is no valid connection.

{{ NgDocActions.demoPane("ConnectionValidationDemoComponent") }}
