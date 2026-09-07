# Keep the core theme contract independent of UI

ngx-vflow owns overrideable CSS tokens with defaults for its standalone presentation needs. An optional @vflow/ui theme maps its values onto those core tokens, while core remains independent of the UI package. This preserves a usable core-only integration and lets applications theme engine feedback without adopting the first-party UI theme; moving default presentations into UI does not remove core's own theme contract.

CSS is the public styling contract: shared theme values use general semantic tokens, while part-specific details use ordinary CSS instead of a component-token catalogue. Programmatic presentation parameters such as `resizerColor` are removed during the major migration. User token overrides take precedence over UI theme mappings, which take precedence over core defaults; importing UI CSS alone must not theme a standalone flow outside an explicitly themed scope.

Local CSS variables follow ordinary DOM inheritance. Toolbar and minimap use the editor theme; local node themes are not copied into separate rendering layers automatically.
