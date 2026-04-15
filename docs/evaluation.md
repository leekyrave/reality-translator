# Model Evaluation Notes

## Summary

Evaluation of locally-run LLM candidates for prompt-driven tasks.

---

## Models

### Bielik
- **Verdict:** ❌ Not recommended
- Loses context quickly over multi-turn conversations
- Does not reliably follow pre-defined system prompts/instructions

### Gemma 4 Small
- **Verdict:** ✅ Recommended
- Fast inference, good instruction-following
- Best balance of speed, quality, and resource usage for our tasks

### Gemma 4 Large
- **Verdict:** ⚠️ Overkill
- Overengineered for our current use cases
- Higher resource cost without meaningful quality gain

---

## Decision

**Go with `gemma:4-small`** as the default model for prompt-driven workflows.
Revisit `gemma:4-large` only if task complexity increases significantly.