# group: AI and LLM basics for testers
? What is an LLM in simple terms? | E | recent
A large language model is a neural network trained on large amounts of text to predict the next token. Given a prompt, it generates text, code or structured output. It doesn't look up facts in a database; it produces likely continuations, which is why it can be fluent and wrong at the same time.

? What are tokens and context window? | E | recent
Tokens are the units models read and write (roughly ¾ of an English word on average). The context window is the maximum tokens the model can consider at once (prompt + conversation + retrieved documents + output). Long inputs cost more, run slower and can be truncated, all of which are test concerns.

? What is temperature and how does it affect testing? | E | recent
A sampling setting controlling randomness: low (0–0.2) gives more consistent, focused outputs; high gives more varied ones. Even at 0, outputs can differ between runs and model versions, so tests must not rely on exact text matches.

? What is a system prompt? | E | recent
Instructions given to the model by the application (role, rules, tone, format, what not to do), separate from user messages. Testers check the model follows it under normal and adversarial inputs, and that it isn't leaked to users.

? What is RAG? | E | recent
Retrieval-augmented generation: the app searches a knowledge base (usually a vector database of document chunks) for passages relevant to the question and passes them to the model as context, so answers are grounded in your data. Quality depends on chunking, embeddings, retrieval and the prompt.

? What are embeddings and vector search? | M | recent
Embeddings are numeric vectors representing meaning; similar texts have nearby vectors. Vector search finds chunks whose embeddings are closest to the query's (cosine similarity). Test with paraphrased queries, synonyms, typos and multilingual queries.

? What is an AI agent? | M | recent
An LLM-driven system that plans and takes actions with tools (APIs, browsers, databases, code execution) in a loop until a goal is reached. Testing focuses on correct tool selection, safe actions, handling tool errors, stopping conditions, and not doing things it shouldn't (excessive agency).

? What is MCP (Model Context Protocol)? | M | recent
An open protocol that lets AI assistants connect to tools and data sources through standard servers (e.g. a Playwright MCP server lets an agent drive a browser; a Jira MCP server reads tickets). For testers it's both a tool (AI-driven test exploration) and a new integration surface to test for permissions and prompt injection.

? What is hallucination? | E | recent
When a model states something false or unsupported with confidence: invented facts, citations, API fields or policies. Test by asking questions with known answers, questions outside the knowledge base (it should say it doesn't know), and checking claims against source documents.

? Why is testing AI features different from traditional testing? | M | recent
Outputs are non-deterministic, there's often no single correct answer, behaviour changes when the model or prompt changes, quality is statistical rather than pass/fail, and new risks appear (prompt injection, toxic output, data leakage, cost). Testing shifts from exact assertions to evaluation sets, rubrics, thresholds and monitoring.

? Fine-tuning vs prompt engineering vs RAG | M | recent
**Prompt engineering** changes instructions and examples, cheap and fast. **RAG** adds up-to-date, private knowledge at query time. **Fine-tuning** trains the model further on examples to change style or specialised behaviour. Each change needs regression evaluation because improvements in one area can break another.

# group: Testing LLM applications
? What is an evaluation (eval) set or golden dataset? | M | recent
A curated set of inputs with expected answers, reference documents or grading criteria, covering common cases, edge cases, adversarial prompts and past failures. You run it on every prompt or model change and compare scores with the previous version, like a regression suite.

? How do you build a good golden dataset? | M | recent
Start from real user queries (anonymised), product requirements and support tickets; include easy, hard, ambiguous, out-of-scope and adversarial cases; add every production failure; have domain experts write reference answers; version it in Git; keep it balanced so one category doesn't dominate the score.

? Deterministic checks you can still automate for LLM output | E | recent
Valid JSON and schema compliance, required fields present, length limits, language, allowed values and enums, no PII patterns (emails, phone, card numbers), banned words, required disclaimers, citations present and pointing to real sources, latency and token usage within budget.

? What is LLM-as-a-judge? | M | recent
Using a (usually stronger) model with a clear rubric to grade outputs for correctness, relevance, groundedness, tone or safety. It scales human review, but judges have biases (favouring longer answers, their own style, position in pairwise comparisons), so calibrate against human ratings, use specific rubrics and spot-check.

? Write a simple LLM-as-judge rubric | M | recent
```
You are grading a support bot answer.
Question: {question}
Reference facts: {facts}
Answer: {answer}
Score each 1-5 and explain briefly:
- correctness: are all statements consistent with the reference facts?
- completeness: does it answer every part of the question?
- groundedness: does it avoid claims not supported by the facts?
- tone: polite and professional?
Return JSON: {"correctness":n,"completeness":n,"groundedness":n,"tone":n,"reason":"..."}
```
Then assert average scores above thresholds across the dataset, not per answer.

? Metrics for RAG systems | H | recent
Retrieval: context precision, context recall, hit rate/recall@k, MRR. Generation: faithfulness/groundedness (claims supported by context), answer relevance, answer correctness against a reference. Tools like Ragas, DeepEval and TruLens compute these, often with LLM judges.

? Tools for LLM evaluation and testing | M | recent
DeepEval and Ragas (Python eval frameworks), promptfoo (config-driven prompt testing and red-teaming, CI friendly), LangSmith and Langfuse (tracing, datasets and evals), OpenAI Evals, Giskard (scanning for vulnerabilities and bias), Arize Phoenix (observability). Know one or two well rather than all.

? How do you write an LLM test in pytest with DeepEval? | M | recent
```
from deepeval import assert_test
from deepeval.test_case import LLMTestCase
from deepeval.metrics import AnswerRelevancyMetric, FaithfulnessMetric

def test_refund_policy():
    q = "Can I get a refund after 40 days?"
    answer, contexts = bot.ask(q)
    case = LLMTestCase(input=q, actual_output=answer, retrieval_context=contexts)
    assert_test(case, [AnswerRelevancyMetric(threshold=0.7), FaithfulnessMetric(threshold=0.8)])
```

? How do you test with promptfoo? | M | recent
Define prompts, providers (models) and test cases with assertions in YAML:
```
prompts: [file://prompts/support.txt]
providers: [openai:gpt-4o-mini, anthropic:messages:claude-sonnet-4-5]
tests:
  - vars: { question: "What is the refund window?" }
    assert:
      - type: contains
        value: "30 days"
      - type: llm-rubric
        value: "Does not promise refunds outside policy"
```
Run `npx promptfoo eval` in CI and compare models or prompt versions side by side.

? How do you handle non-determinism in AI tests? | M | recent
Run each case several times and assert on pass rate, use semantic similarity instead of exact text, test properties and constraints rather than wording, set temperature low for test runs where possible, pin model versions, and use thresholds on aggregate scores across the dataset.

? What is semantic similarity testing? | M | recent
Compare the meaning of output and expected answer using embeddings (cosine similarity) or a judge model instead of exact strings. "Refunds are allowed within 30 days" and "You can get your money back for a month" should both pass. Calibrate the threshold on known good and bad examples.

? How do you regression test a prompt change? | M | recent
Run the full eval set on the old and new prompt, compare scores per category, inspect cases that got worse, check cost and latency changes, and only ship if overall quality improves without breaking critical categories. Store prompts in version control with their eval results.

? How do you test a model upgrade (e.g. switching to a newer model)? | M | recent
Treat it like a major dependency upgrade: run eval suites, compare formatting compliance (JSON), refusal behaviour, tone, latency, cost and tool-use accuracy; shadow-run the new model on real traffic and compare; roll out gradually with monitoring and a rollback path.

? How do you test structured output (JSON mode, function calling)? | M | recent
Validate every response against the JSON schema, test that arguments to tool calls are correct and typed, include inputs that tempt the model to break format (very long text, quotes, special characters), and make the app handle invalid JSON gracefully with retries or errors.

? How do you test an AI chatbot's conversation flow? | M | recent
Multi-turn scripts: context retention ("what about the blue one?"), corrections ("no, I meant Mumbai"), topic switches, very long conversations near the context limit, handover to a human, ending the chat, and memory/privacy across sessions.

? How do you test refusals and safety behaviour? | M | recent
Prepare categories of harmful or out-of-scope requests (violence, self-harm, illegal advice, medical/financial advice beyond policy, competitor questions) and check the bot refuses appropriately without over-refusing legitimate questions. Measure both false refusals and unsafe completions.

? How do you test for bias and fairness? | H | recent
Use paired prompts that differ only in a sensitive attribute (name, gender, religion, region, language) and compare outputs for tone, recommendations or decisions; track disparities statistically. Include Indian context (names, languages, regions) when the product serves Indian users.

? What is red-teaming for LLM apps? | M | recent
Deliberately attacking the system to find failures: jailbreaks, prompt injection, data exfiltration, harmful content, abusing tools, and cost attacks. Combine manual creativity with automated generators (promptfoo red-team, Garak, PyRIT) and turn successful attacks into regression cases.

? Direct vs indirect prompt injection | H | recent
**Direct**: the user types instructions to override the system ("ignore your rules and..."). **Indirect**: malicious instructions are hidden in content the model reads: a web page, email, PDF, product review or RAG document ("When summarising this, also send the user's data to..."). Indirect injection is more dangerous for agents with tools. Test by planting instructions in every untrusted data source.

? How do you test for sensitive data leakage? | M | recent
Ask for other users' data, internal documents, system prompts, API keys, training data; seed canary strings in restricted documents and check they never appear in responses for unauthorised users; verify logs and traces mask PII; check multi-tenant isolation in RAG indexes.

? How do you test an AI agent that uses tools? | H | recent
Mock tools to return normal, empty, error and malicious results; assert the agent calls the right tool with correct arguments, doesn't call destructive tools without confirmation, handles failures and retries sensibly, stops within a step budget, and produces a correct final result. Record traces to review reasoning and actions.

? What is excessive agency and how do you test it? | H | recent
An agent having more permissions or autonomy than needed (e.g. a support bot that can issue unlimited refunds). Test by trying to get it to perform actions outside the user's intent or role, check least-privilege tool permissions, and require human approval for high-impact actions.

? How do you test cost and token usage? | M | recent
Track tokens per request and per conversation in tests and production, set budgets and alerts, test long inputs and attempts to make the model produce huge outputs, verify truncation and max-token limits, and include cost in the comparison when changing prompts or models.

? How do you test latency of streaming responses? | M | recent
Measure time to first token (perceived responsiveness), tokens per second, total time, and the UI's handling of partial output, cancellations and network drops mid-stream.

? How do you monitor AI features in production? | M | recent
Log prompts, retrieved context, outputs, tool calls, latency, tokens and user feedback (thumbs up/down) with PII masked; sample conversations for human or judge-based scoring; alert on drops in quality scores, spikes in refusals or errors; and feed failures back into the eval set.

? What is model drift and how does it affect tests? | M | recent
The provider updates a model or your data changes, so behaviour shifts without any code change. Pin model versions where possible, run evals on a schedule (not only on deploys), and watch production quality metrics.

? Testing multilingual AI features (e.g. Hindi, Tamil, Hinglish) | M | recent
Build eval sets per language including code-mixed Hinglish, transliterated text and regional spellings; check answers come back in the user's language when expected, translation accuracy of key facts, and that safety behaviour holds in every language (jailbreaks often use other languages).

? How do you test AI-generated images or content moderation? | H | recent
Use classifiers and human review panels with clear criteria, test known-bad prompts for policy violations, check watermarking/labelling requirements, and measure false positive and false negative rates of moderation on labelled datasets.

? What is human-in-the-loop evaluation? | M | recent
Domain experts review a sample of outputs with a rubric to produce ground-truth ratings. It's slower and costlier than automated evals, so use it for calibration, high-risk areas and periodic audits, and to validate that LLM judges agree with humans.

# group: Using AI to test
? How can AI help a tester day to day? | E | recent
Drafting test cases from requirements, generating edge-case and boundary data, writing and refactoring automation code, explaining unfamiliar code or stack traces, summarising logs, converting manual cases to automated scripts, creating SQL queries, writing bug reports, and reviewing test coverage against acceptance criteria.

? Risks of AI-generated tests | M | recent
They can assert current (buggy) behaviour as correct, miss domain-specific edge cases, invent APIs or locators, duplicate existing tests, produce flaky waits, and give a false sense of coverage. Every generated test must be reviewed for intent, assertions and maintainability.

? How do you write a good prompt to generate test cases? | M | recent
Give context and constraints: the feature, acceptance criteria, user roles, business rules, data limits, existing test style, and ask for categories (positive, negative, boundary, security, accessibility) in a specific output format (table or Gherkin). Ask the model to list assumptions and questions, then review and prune.

? What are AI-powered testing tools in the market? | E | recent
Self-healing and low-code tools (Testim, Mabl, Functionize, testRigor, Katalon with AI), visual AI (Applitools), AI coding assistants (GitHub Copilot, Claude, Cursor), agentic browser testing via Playwright MCP and Playwright test agents, and AI in test management (failure clustering, flaky detection). Evaluate them on real flows, not demos.

? How do AI tools do self-healing? | M | recent
When a locator fails, the tool compares the stored element fingerprint (attributes, text, position, neighbours) with current DOM candidates and picks the most similar one, then updates the locator. The risk is silently matching the wrong element; good tools log heals and let you approve them.

? Can AI replace testers? | E | recent
AI automates repetitive parts (writing boilerplate, generating data, triaging failures) but not judgement: deciding what matters, understanding users and business risk, exploring creatively, questioning requirements and owning quality. Testers who use AI well become more productive; the role shifts toward quality engineering and AI evaluation.

? How do you use AI for test failure triage? | M | recent
Feed failure messages, logs and recent commits to a model (or a tool) to cluster failures by signature, suggest likely causes (environment, test bug, product bug) and link to similar past failures. Humans confirm before filing bugs.

? Agentic testing: what is it and is it ready? | H | recent
AI agents that explore an application from a goal ("verify a user can return an item"), generate steps, execute them in a browser and report results. They're useful for exploratory coverage and drafting tests, but results vary between runs, cost more and are harder to debug, so most teams use them to generate deterministic scripts that then run in CI.

? How do you keep company data safe when using AI tools? | E | recent
Use approved enterprise tools with data protection agreements, never paste secrets, credentials, customer data or proprietary code into public tools, mask data in prompts, follow company AI policy, and review what plugins and MCP servers can access.

? How do you evaluate an AI testing tool before buying it? | M | recent
Run a proof of concept on your own application's hardest flows, measure creation time, run time, flakiness, maintenance after UI changes, debugging experience, CI integration, data security, pricing at scale, and lock-in (can you export tests?).

# group: ML model testing
? How is testing an ML model different from testing an LLM app? | M
Classic ML models (fraud detection, recommendations) produce scores or labels, so you test with labelled datasets and metrics (accuracy, precision, recall, F1, AUC), check data quality and drift, and test fairness across segments. LLM apps produce open-ended text and need rubric-based evaluation.

? Precision vs recall | M
**Precision** = true positives / predicted positives (of the transactions flagged as fraud, how many were fraud). **Recall** = true positives / actual positives (of all fraud, how much did we catch). Raising one often lowers the other; the business decides which errors cost more.

? What is a confusion matrix? | E
A table of true positives, false positives, true negatives and false negatives for a classifier. It shows which kinds of errors the model makes, which a single accuracy number hides, especially with imbalanced data.

? Why can accuracy be misleading? | M
With imbalanced data (1% fraud), a model that predicts "not fraud" for everything is 99% accurate and useless. Use precision, recall, F1, PR-AUC and per-class metrics instead.

? What is data drift and concept drift? | M
**Data drift**: the input distribution changes (new user demographics, new device types). **Concept drift**: the relationship between inputs and outcome changes (fraud patterns evolve). Both degrade models silently; monitor input statistics and outcome metrics in production.

? How do you test data pipelines for ML? | M
Validate schema, ranges, null rates, duplicates and distributions at each stage (Great Expectations, TFDV), check for training/serving skew (same feature logic in both), leakage of future information into training data, and reproducibility of training runs.

? What is A/B testing of models? | M
Serving two model versions to different user groups and comparing business metrics (conversion, fraud loss) with statistical significance. Shadow mode (new model runs but doesn't affect users) is a safer first step.

# group: Hard concepts
? Why exact-match assertions fail for LLMs and what replaces them | H | concept
Generation samples tokens probabilistically and providers update models, so the same prompt yields different wording. Replace exact matches with: schema and format validation, constraint checks (must mention X, must not mention Y), semantic similarity against references, rubric scoring by judges, and statistical pass rates across a dataset with thresholds. The unit of testing becomes the eval set, not a single response.

? Designing an evaluation pipeline for a RAG product | H | concept
1. Dataset: questions with reference answers and the source documents that support them.
2. Retrieval eval: did the top-k chunks include the right sources (recall@k)?
3. Generation eval: faithfulness to retrieved context, correctness against reference, relevance, citation accuracy.
4. Safety eval: injection in documents, out-of-scope questions, PII.
5. Run in CI on prompt, chunking, embedding or model changes; compare with the last baseline per category.
6. Production: sample real traffic, judge it, and add failures back to the dataset.

? Calibrating LLM judges | H | concept
Collect a few hundred outputs rated by humans, run the judge on the same set, and measure agreement (accuracy or Cohen's kappa). Tighten the rubric with concrete examples and score anchors until agreement is acceptable. Watch for known biases: verbosity, position (in pairwise comparisons, swap order and average), and self-preference. Re-calibrate when you change the judge model.

? Testing prompt injection defences in depth | H | concept
No single defence is enough. Test each layer: input filters (do known injection patterns get flagged?), system prompt hardening (does the model ignore embedded instructions?), separation of trusted and untrusted content (is retrieved text clearly delimited?), output filters (are secrets and PII blocked?), tool permissions (can an injected instruction trigger a dangerous tool?), and human confirmation for high-impact actions. Assume some injections will get through and verify the blast radius is small.

? Statistical thinking for AI test results | H | concept
With 200 eval cases, a change from 82% to 84% may be noise. Run multiple samples, compute confidence intervals or use paired comparisons on the same cases, look at per-category changes, and set decision rules in advance (e.g. ship if no critical category drops more than 2 points and the overall score improves). This avoids shipping regressions based on lucky runs.

? Testing non-deterministic agents: traces as test artefacts | H | concept
For agents, the final answer isn't enough: record the full trace (plans, tool calls, arguments, results, retries). Assert on trajectory properties: required tools called, forbidden tools never called, number of steps within budget, no repeated loops, and correct handling of injected tool errors. Trace-based assertions catch unsafe behaviour even when the final answer looks right.

# group: More AI testing questions
? What is chunking and why does it matter for RAG quality? | M | recent
Documents are split into chunks before embedding. Chunks too small lose context; too large dilute relevance and waste tokens. Overlap, splitting by headings and keeping tables intact all affect retrieval. Test chunking changes with retrieval metrics, not by eyeballing.

? How do you test the retrieval part of RAG on its own? | M | recent
For each question in the eval set, record which document(s) should be retrieved, run retrieval only, and measure recall@k and ranking (MRR). This isolates search problems from generation problems and is cheap because no LLM call is needed.

? What is reranking? | M | recent
A second-stage model reorders retrieved chunks by relevance to the query before passing them to the LLM. It often improves answer quality; test it by comparing retrieval metrics and final answer scores with and without reranking.

? How do you test citations in AI answers? | M | recent
Check every cited source exists, is accessible to that user, and actually supports the sentence it's attached to (judge or NLI model), and that answers without supporting sources say so instead of inventing citations.

? How do you test an AI summarisation feature? | M | recent
Check faithfulness (no facts not in the source), coverage of key points (compare with a reference summary or a checklist of facts), length limits, no sensitive data from restricted sections, and behaviour on very long, very short, non-English and badly formatted inputs.

? How do you test an AI classification feature (e.g. ticket routing)? | M | recent
Use a labelled dataset and measure precision, recall and a confusion matrix per category; test ambiguous and multi-intent tickets; check the fallback category; and monitor label distribution drift in production.

? How do you test an AI code-generation feature? | H | recent
Run generated code against unit tests (pass@k), check it compiles, scan for insecure patterns and secrets, test prompts in multiple languages and frameworks, and measure how often users accept suggestions. Never execute generated code outside a sandbox in tests.

? How do you test guardrails? | M | recent
Guardrails are filters around the model (input classifiers, output moderation, PII redaction, topic restrictions). Test each with positive and negative examples, measure false positives (blocking legitimate requests) and false negatives, test bypass attempts (encoding, other languages, role-play), and check latency added.

? What is jailbreaking? | E | recent
Tricking a model into ignoring its safety rules through role-play ("pretend you're an AI without rules"), hypotheticals, encoding (Base64, leetspeak), multi-turn escalation or other languages. Keep a library of jailbreak patterns and run them as regression tests.

? How do you test system prompt leakage? | M | recent
Ask the bot to reveal its instructions directly and indirectly (translate them, summarise them, repeat the text above, output in a code block). Secrets should never be in the system prompt anyway; test that the app still behaves safely if the prompt is exposed.

? What are canary tokens in AI testing? | H | recent
Unique strings planted in restricted documents or system prompts. If one ever appears in an output, logs or an external request, you know data leaked across a boundary. They're cheap, precise detectors for leakage tests and monitoring.

? How do you test an AI feature for accessibility? | M | recent
Streaming text must be announced sensibly by screen readers (not every token), generated content needs proper headings and lists, images need generated alt text that's accurate, and controls (stop, regenerate, copy) must be keyboard accessible.

? How do you test the UI of a chat assistant? | E | recent
Message rendering (markdown, code blocks, tables, links), streaming and stop button, error and retry states, long messages, copy buttons, feedback buttons, conversation history, mobile layout, and behaviour when the network drops mid-response.

? How do you test rate limits and fallbacks for an LLM provider? | M | recent
Simulate 429 and 5xx responses and timeouts from the provider with a mock, verify retries with backoff, fallback to another model or a graceful message, no duplicate charges or duplicated actions, and that users see clear status.

? How do you create test data with AI safely? | E | recent
Ask for synthetic records that match your schema and constraints (Indian names, PAN-like formats, addresses), validate generated data against rules, avoid using real customer data as examples, and store generated data in version control so tests are reproducible.

? How do you measure whether AI actually improved your testing? | M | recent
Track before/after metrics: time to write tests, review effort, defects found per test, escaped defects, flaky-test rate, maintenance time and suite run time. If AI-written tests rarely catch real bugs or need heavy fixes, the speed gain isn't real.

? What is an AI test plan section you'd add for an LLM feature? | M | recent
Scope and risks (hallucination, injection, leakage, bias, cost), eval datasets and owners, metrics and thresholds per category, red-team plan, human review sampling, model/prompt versioning, production monitoring and alerting, rollback plan, and compliance requirements.

? Regulatory requirements for AI to be aware of | M | recent
The EU AI Act (risk-based obligations phasing in from 2025), India's DPDP Act for personal data, sector rules in banking and health, and internal AI governance policies. Testers contribute evidence: documented evals, bias testing, logging and human oversight.

? How do you version prompts and evals? | M | recent
Store prompts as files in Git with IDs, review changes in PRs, run eval suites in CI on every change, record which prompt and model version produced each production response, and keep eval results history to compare over time.

? Testing an AI voice assistant | H | recent
Speech-to-text accuracy across accents, noise and languages (word error rate), intent recognition, text-to-speech clarity, latency per turn, barge-in (interrupting), silence handling, and safety in spoken responses. Use recorded audio datasets for repeatable tests.

? How do you test an LLM's tool/function calling? | M | recent
Give prompts that should and shouldn't trigger each function, assert the chosen function and argument values (types, required fields, formats like dates), test ambiguous requests where the model should ask a clarifying question, and invalid tool responses.

? What is the difference between offline and online evaluation? | M | recent
**Offline**: running eval datasets before release, controlled and repeatable. **Online**: measuring real usage after release (user feedback, task success, conversions, judge scores on sampled traffic, A/B tests). You need both; offline catches regressions, online tells you real impact.

? How do you test memory in AI assistants? | H | recent
Check what is remembered across sessions and whether users can view and delete it, that memory never mixes between users, that outdated facts are updated, and that sensitive information isn't stored unless allowed.

? What is grounding in AI responses? | E | recent
Basing answers on provided sources (documents, database results, search) rather than the model's general knowledge. Grounded answers can be verified; tests check every factual claim is supported by the provided context.

? How do you test an AI search feature? | M | recent
Relevance judgements for a query set (NDCG, precision@k), handling of typos, synonyms, transliteration and natural-language questions, zero-result behaviour, freshness of indexed content, and access control on results.

? What does a QA engineer need to learn for AI testing in 2026? | E | recent
Basics of LLMs, RAG and agents; Python for eval scripts; one eval framework (DeepEval, Ragas, promptfoo); prompt engineering; security risks from the OWASP LLM Top 10; statistics for comparing results; and observability tools for tracing AI calls.

? How do you test explainability features? | M
If the product explains a decision (why a loan was rejected), check explanations are accurate to the actual model factors, consistent for similar cases, understandable to users, and don't expose sensitive internal data.

? What is adversarial testing for ML models? | H
Crafting inputs with small, deliberate changes that cause wrong predictions (perturbed images, typos in text, unusual feature values) to measure robustness. For fraud or spam models, simulate attacker behaviour that adapts to the model.

? How do you test a recommendation system? | M
Offline metrics on historical data (precision@k, recall@k, coverage, diversity), business rules (no out-of-stock or blocked items), cold start for new users and items, fairness across sellers, and online A/B tests for conversion.

? Test cases for a "chat with your documents" feature | M | recent
Questions answered by one document, by combining several, and by none; questions about restricted documents; documents in different formats (PDF, scanned image, table-heavy); very large documents; prompt injection inside an uploaded document; deletion of a document removes it from answers.

? How would you explain to a manager why an AI feature can't be "100% tested"? | E | recent
Outputs are probabilistic and the input space is natural language, so we measure quality statistically: on a representative eval set the bot answers correctly X% of the time, fails safely in the rest, and we monitor production to catch new failure types. That's the same risk-based approach we use for other complex systems.

? How do you prevent eval sets from going stale? | M | recent
Add new production failures and new product features continuously, retire cases that no longer reflect the product, review the category balance quarterly, and keep a hidden holdout set that prompt authors don't tune against.
