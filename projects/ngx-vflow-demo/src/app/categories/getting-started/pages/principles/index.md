# {{ NgDocPage.title }}

This page contains a list of general principles that impact feature implementation.

- No hidden mutations of your data. For example, the library does not modify any of the `Node` or `Edge` objects you pass in as inputs. Instead, it creates internal models around these entities and operates on them. Any changes to the passed entities can be observed through events.
- This principle also implies that you are responsible for managing invalid data. For instance, if you delete a node, the edges corresponding to this node will not be deleted automatically. However, the library will notify you about detached edges so that you can easily delete them.

