A request path, left to right.

```reladraw
style store  fill: theme-primary-subtle  border: theme-primary  badge: database

node browser  "Browser"
node api      "API server"  right of browser
node db       "Postgres"    right of api    style: store
node worker   "Worker"      below api

edge browser -> api  "HTTP"    from: right  to: left
edge api -> db       "SQL"     from: right  to: left
edge worker -> db    "writes"  from: right  to: bottom
```

Text after the diagram.
