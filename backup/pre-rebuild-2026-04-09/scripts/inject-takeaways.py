#!/usr/bin/env python3
"""Insert <div class="takeaway"> on each slide in slides.md (split by ---)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLIDES = ROOT / "slides.md"

# First heading ## … on each slide → plain-language takeaway (short).
TAKEAWAYS: dict[str, str] = {
    "Today's Agenda": "Two hours: first connect the ideas, then you build and break a retrieval pipeline yourself.",
    "Lecture roadmap (what to expect)": "Same story four ways—overview, math you can skim, tiny code you can read, then tools and limits.",
    "How LLMs Actually Work": "This block is the engine room: tokens, loss, attention, a toy GPT, then how we actually generate text.",
    "The Core Idea": "The whole training game is guessing the next piece of text; surprisingly, that one trick scales into assistants.",
    "Next-word predictor": "Think of it as fancy autocomplete: past text in, a probability list for the very next token out.",
    "Tokenisation": "The model never sees “words” the way you do—only variable-length chunks from its tokenizer.",
    "The loss function (1/3) — Cross-entropy on the true next token": "Training is thousands of tiny quizzes: did you put enough probability on the token that really came next?",
    "The loss function (2/3) — Teacher forcing": "While learning, the model reads the real textbook; while chatting, it reads its own rough draft—hence decoding tricks.",
    "The loss function (3/3) — What “learning” means here": "Lower loss means better next-token odds on average—not a certificate of truth or ethics.",
    "Probability warm-up — Toy counts (Alice)": "Counting n-grams is the kindergarten version of what neural nets learn smoothly at scale.",
    "Probability warm-up — Why “word salad” can score like English": "If you ignore word order, any shuffle looks equally silly—context is what makes real sentences stand out.",
    "Evaluating language models — Perplexity (and scaling laws)": "Perplexity is “how surprised was the model on held-out text”; scaling laws say bigger budgets usually help until they don’t.",
    "Self-Attention: Q, K, V": "Each position learns which other words to borrow meaning from before predicting what comes next.",
    "Generation, Scaling & nanoGPT": "Train predicts the next token; decoding chooses how it speaks; scaling laws say how to spend budget; nanoGPT shows the whole pipeline fits in a short file.",
    "N-gram vs Transformer — Probability Distribution": "Same blank, two brains: the bigram only sees a sliver of history; the transformer uses the whole passage you showed it.",
    "h Subspaces (one per head)": "Attention heads are parallel specialists—syntax, long range, whatever—whose outputs get stitched back together.",
    "More math (1/2) — From tokens to vectors to Q, K, V": "Embeddings turn symbols into numbers; Q/K/V are three learned ways to ask, advertise, and carry content.",
    "More math (2/2) — Scores, scaling, softmax": "Compare every word to every word, soften with softmax, then take a weighted mix of value vectors—that mix is the update.",
    "Multi-Head Attention": "Run several attention patterns at once, concatenate, mix once more—like ensemble models inside one layer.",
    "Multi-Head Attention — Live": "There is no single “right” attention map—heads specialize; blending them shows how the model mixes their votes.",
    "How To Explain These Visuals": "Tell the room: better context beats local counts, and multiple heads mean multiple simultaneous focuses.",
    "Position Encodings": "Without position, a bag of words has no story—this term puts order back in after embedding.",
    "Context & Context Length": "The model has a fixed window; older text falls off the left unless you retrieve or summarize it back in.",
    "nanoGPT — GPT in ~300 Lines": "If you read one file end-to-end, you have seen the skeleton every large GPT still uses.",
    "Scaling Laws": "More parameters and more tokens usually lower loss along smooth curves—until data, compute, or the objective itself caps you.",
    "What the terms mean (why the equation is useful)": "The equation tells you whether to buy more GPU, more data, or accept an objective floor.",
    "Chinchilla: compute-optimal training": "For a fixed budget, balance model size and tokens—bigger is not better if you starve it of data.",
    "How generation works (1/2) — Autoregressive loop": "You repeatedly ask “what’s next?” and append; one bad token can steer the whole rest of the answer.",
    "How generation works (2/2) — Where “sampling strategy” lives": "Weights pick tendencies; temperature and top-p pick how wild each next choice is.",
    "Logits -> probabilities (softmax)": "Raw scores become a legal probability table—everything positive and summing to one.",
    "Temperature reshapes the distribution": "Temperature is a creativity dial on the same brain—lower is safer, higher is chattier and riskier.",
    "Decoding & Sampling Knobs (temperature / top-p / top-k)": "These knobs shrink the candidate list before you roll the dice—cheap guardrails at inference time.",
    "Beam Search vs Sampling (and practical defaults)": "Beam search hunts safe continuations; sampling explores language—pick based on whether you want reliability or variety.",
    "Inference loop — full system (conceptual)": "Serving is the same math as training, wrapped in tokenizers, caches, and batching so it feels instant.",
    "The full pipeline — three pieces": "Train the brain on text, roll the dice to speak, then align the personality with examples and preferences.",
    "Final mental model — in one quote": "ChatGPT is still next-token prediction plus attention plus sampling—alignment layers manners on top.",
    "The Full Training Stack": "We now move from raw weights to assistants: teach format, then teach taste.",
    "Post-training (1/2) — Instruction tuning (SFT)": "Show thousands of good conversations and the model learns the assistant shape—answers, refusals, formatting.",
    "Post-training (2/2) — Preferences & reinforcement (RLHF / DPO)": "Humans pick preferred answers; the model nudges toward those choices without memorizing a rule book.",
    "From Pretraining to Assistant": "Each stage shrinks the behavior space until the model feels helpful instead of merely fluent.",
    "Full Fine-Tuning vs. LoRA / QLoRA": "Full updates everything; LoRA trains a thin adapter so laptops can personalize a big base model.",
    "RLHF vs. DPO": "Both learn from preferences—RLHF uses an explicit reward loop; DPO folds it into a simpler loss.",
    "Prompting vs. RAG vs. Fine-Tuning": "Prompts are free, retrieval adds facts without retraining, fine-tuning changes the weights—escalate only when needed.",
    "Capabilities & Honest Limitations": "Celebrate strengths, name failure modes—both belong in the same breath.",
    "What LLMs Are (and Aren't) Good At": "Great pattern machines, shaky calculators and fact vaults—plan accordingly.",
    "Benchmarks — Useful and Gameable": "Leaderboards hint at skill, but your own held-out tasks tell you if it works for you.",
    "The Stochastic Parrot Debate": "Stay humble—fluency is real, grounding is still argued, neither extreme tells the whole story.",
    "LLMs as Scientists": "Research agents are just LLMs with retrieval, code, and a loop that won’t quit until the job ends.",
    "The AI Scientist (Lu et al., 2024)": "Automate hypothesis to PDF by chaining tools; the novelty is orchestration, not one new equation.",
    "Why RAG is the Memory Layer": "Your library is bigger than any context window—retrieve slices, then generate.",
    "LLMs + Tools + Memory = Agents": "Language model in the middle, facts on the left, APIs on the right—that triangle is modern automation.",
    "Agents, RAG & MCP": "Agents glue models to data and actions; MCP standardizes the glue so you write integrations once.",
    "Beyond LLMs: World Models (state → outcomes)": "Language models predict text; world models aim to predict what happens next in the environment.",
    "Yann LeCun's Bet: AMI Labs (world models)": "Some teams bet that modeling the world beats ever-larger chatbots alone.",
    "What is an Agent?": "An agent keeps acting—observe, think, tool-call—until the task is finished, not just one reply.",
    "Agent Patterns": "Most shipped agents are ReAct-style: think a step, call a tool, read the result, repeat.",
    "RAG — Under the Hood": "If retrieval fails, generation fails—chunk carefully, rerank aggressively, then ask the model.",
    "RAG Variants Worth Knowing": "Fancy RAG names are patches for specific misses; measure first, then adopt the variant you need.",
    "What is MCP?": "MCP is a shared plug shape for tools so hosts and models stop rewriting bespoke integrations.",
    "MCP in Practice": "Same protocol can hit Slack, Postgres, or GitHub—swap servers, keep the agent code.",
    "Agents + RAG + MCP Together": "Planner decides when to read docs versus poke an API; MCP makes those pokes portable.",
    "Where Agents Break Down": "Long loops amplify small mistakes—keep steps short, watch tool errors, cap retries.",
    "Resources & Next Steps": "These links are your post-workshop syllabus—papers for theory, repos for practice.",
    "Q&A": "Bring questions tied to your project—deployment, retrieval, or classroom use.",
}


def slide_key(block: str) -> str | None:
    t = block.strip()
    if re.match(r"^#\s+Q&A", t, re.M):
        return "Q&A"
    for line in block.splitlines():
        if line.startswith("## "):
            return line[3:].strip()
    return None


def main() -> None:
    text = SLIDES.read_text(encoding="utf-8")
    parts = text.split("\n---\n")
    out: list[str] = []
    missing: list[str] = []
    for block in parts:
        if 'class="takeaway"' in block:
            out.append(block)
            continue
        t = block.strip()
        if t.startswith("# LLMs") and "## " not in t:
            out.append(block)
            continue
        key = slide_key(block)
        if key is None:
            missing.append(block[:120].replace("\n", " "))
            takeaway = None
        else:
            takeaway = TAKEAWAYS.get(key)
        if takeaway is None:
            if key:
                missing.append(f"MISSING KEY: {key!r}")
            out.append(block)
            continue
        block = block.rstrip()
        block += f"\n\n<div class=\"takeaway\">{takeaway}</div>\n"
        out.append(block)

    SLIDES.write_text("\n---\n".join(out), encoding="utf-8")
    if missing:
        print("WARNINGS:", file=sys.stderr)
        for m in missing:
            print(" ", m, file=sys.stderr)
        sys.exit(1)
    print(f"Updated {SLIDES} with takeaways.")


if __name__ == "__main__":
    main()
