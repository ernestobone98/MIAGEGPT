#!/bin/bash

curl https://api.openai.com/v1/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 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" \
  -d '{
    "model": "text-davinci-003",
    "prompt": "Propose un nom pour la MIAGE de Nice: ",
    "max_tokens": 7,
    "temperature": 1
  }'
