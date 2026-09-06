# Keep graph state application-owned

ngx-vflow core remains a controlled rendering and interaction engine: the consuming application owns the authoritative graph state, and core does not maintain a separate authoritative graph store. Core may synchronously update application-provided `WritableSignal` values for interactive properties such as position, selection, size, and rotation. Structural changes such as adding, removing, or reparenting entities are requests that the application applies. Optional editor-state capabilities may be developed outside the core contract.
