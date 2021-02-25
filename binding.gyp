{
  "targets": [{
    "target_name": "sparse",
    "conditions": [
      ["OS=='win'", {
        "sources": ["src/sparse.cpp"]
      }]
    ],
    "defines": [
      "NAPI_VERSION=3",
    ]
  }]
}
