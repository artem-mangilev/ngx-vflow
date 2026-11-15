---
name: diataxis
description: Structure, classify, and write documentation using the Diátaxis framework. Use when writing docs, README files, guides, tutorials, how-to guides, API references, or organizing documentation architecture. Also use when asked to improve documentation, restructure docs, decide what type of doc to write, or classify existing content. Covers tutorials, how-to guides, reference, and explanation.
---

# Diátaxis Documentation Framework

Apply the Diátaxis systematic framework to structure and write documentation.

## The Four Documentation Types

Diátaxis identifies exactly four types, defined by two axes:

|                          | **Acquisition** (study) | **Application** (work) |
| ------------------------ | ----------------------- | ---------------------- |
| **Action** (doing)       | **Tutorial**            | **How-to guide**       |
| **Cognition** (thinking) | **Explanation**         | **Reference**          |

### 1. Tutorials — learning-oriented

Write tutorials as lessons. Take the learner by the hand through a practical experience where they acquire skills by doing.

- Use first-person plural ("We will...")
- Show where they're going up front
- Deliver visible results early and often
- Ruthlessly minimize explanation — link to it instead
- Focus on the concrete, ignore options and alternatives
- Aspire to perfect reliability

**Load `references/tutorials.md` for full guidance.**

### 2. How-to guides — goal-oriented

Write how-to guides as practical directions for an already-competent user to achieve a specific real-world goal.

- Name clearly: "How to [achieve X]"
- Use conditional imperatives ("If you want x, do y")
- Assume competence — don't teach
- Omit the unnecessary; practical usability > completeness
- Allow flexibility with alternatives

**Load `references/how-to-guides.md` for full guidance.**

### 3. Reference — information-oriented

Write reference as technical description of the machinery. Keep it austere, authoritative, consulted not read.

- Describe and only describe — neutral tone
- Adopt standard, consistent patterns
- Mirror the structure of the product
- Provide examples to illustrate, not explain

**Load `references/reference.md` for full guidance.**

### 4. Explanation — understanding-oriented

Write explanation as discursive treatment that deepens understanding. Answer "Can you tell me about...?"

- Make connections to related topics
- Provide context: why things are so
- Talk _about_ the subject (title: "About X")
- Admit opinion and perspective
- Keep closely bounded — don't absorb other types

**Load `references/explanation.md` for full guidance.**

## The Compass — When In Doubt

Ask two questions to classify content:

1. **Action or cognition?** Is this about doing, or thinking?
2. **Acquisition or application?** Is this for learning, or for working?

The intersection tells you which type you're writing. Load `references/compass.md` for detailed decision guidance.

## How To Apply

1. Classify the content — use the compass questions above.
2. Check for type mixing — does this piece try to do two things at once?
3. Separate mixed content — pull explanation out of tutorials, pull instructions out of reference.
4. Apply the type's principles — follow the bullet points for that type above.
5. Link between types — don't embed, cross-reference instead.

Do NOT create empty four-section structures and try to fill them. Let structure emerge from content.

## Example

User asks: "Write a getting-started guide for our CLI tool."

1. **Classify**: "Getting started" = the user is learning, by doing → **Tutorial**.
2. **Check**: Not a how-to guide — the user isn't solving a specific problem, they're acquiring familiarity.
3. **Apply tutorial principles**:
   - Open with what they'll build: "In this tutorial, we will install the CLI and deploy a sample app."
   - Lead through concrete steps with visible results at each stage.
   - Minimize explanation: "We use `--verbose` for more output" not a paragraph on logging levels.
   - Link to reference for flag details, link to explanation for architecture.
4. **Result**: A focused lesson, not a feature tour disguised as a tutorial.

## Common Mistakes

| Mistake                                                        | Why it fails                                                        | Fix                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| Tutorial that explains everything                              | Explanation breaks the learning flow — learner loses focus          | Move explanation to a separate doc, link to it           |
| How-to guide that teaches basics                               | Competent users don't need onboarding — it wastes their time        | Assume competence, or split into tutorial + how-to       |
| Reference with opinions and advice                             | Users consulting reference need facts, not guidance                 | Move advice to explanation                               |
| Explanation mixed into reference                               | Dilutes both — reference becomes verbose, explanation can't develop | Separate into distinct documents                         |
| "Getting started" that's actually a feature tour               | No learning goal, no coherent journey — user doesn't acquire skill  | Pick one thing the user will accomplish, build toward it |
| Creating empty Tutorials/How-to/Reference/Explanation sections | Structure without content is useless scaffolding                    | Write content first, let structure emerge                |

## Critical Rules

- **Never mix types.** Each type has its own purpose, tone, and form.
- **The user's mode matters.** Study vs. work is the fundamental distinction. Tutorials and explanation serve study. How-to guides and reference serve work.
- **Link between types** rather than embedding one inside another.

## Deep Dives

Load reference files on demand for detailed guidance:

| Topic                                | File                                  |
| ------------------------------------ | ------------------------------------- |
| Writing tutorials                    | `references/tutorials.md`             |
| Writing how-to guides                | `references/how-to-guides.md`         |
| Writing reference docs               | `references/reference.md`             |
| Writing explanation                  | `references/explanation.md`           |
| The compass decision tool            | `references/compass.md`               |
| Tutorials vs how-to distinction      | `references/tutorials-how-to.md`      |
| Reference vs explanation distinction | `references/reference-explanation.md` |
| Workflow methodology                 | `references/how-to-use-diataxis.md`   |
| Why Diátaxis works (foundations)     | `references/foundations.md`           |
| The two-dimensional map              | `references/map.md`                   |
| Quality in documentation             | `references/quality.md`               |
| Complex hierarchies                  | `references/complex-hierarchies.md`   |
