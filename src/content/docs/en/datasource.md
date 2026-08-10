---
title: Add a datasource
order: 3
---

# Adding a datasource

Expose any data source as a first-class provider in the ontology.

## 1. Publish a manifest

Build a catalog that conforms to the `fd-open-data-protocol` manifest contract — declare your functions, columns, entity definitions, relationships, concepts, and bindings (see the [protocol overview](/docs/protocol)).

## 2. Register it

```bash
# a local manifest file
fd-open-data-mcp register-datasource ./my-manifest.yaml

# or a Python module exposing a catalog
fd-open-data-mcp register-datasource my_provider:CATALOG
```

Registration ingests your entities, functions, concepts, and initial bindings into the ontology database.

## 3. Propose and confirm bindings

```bash
fd-open-data-mcp propose-bindings
fd-open-data-mcp review-bindings     # review the below-threshold queue
fd-open-data-mcp confirm-binding <id>
```

## 4. Go live

Once bound, your columns resolve under the ontology's concepts — the semantic layer can rank and fetch your source alongside every other provider, with the same failover and refresh machinery.
