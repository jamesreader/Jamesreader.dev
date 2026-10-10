---
title: "Why a Two-Person Town IT Department Builds Its Own Tools"
slug: building-instead-of-buying-small-town-it
excerpt: "Two of us, eight sites, a police department that never closes. Off-the-shelf software fits about 70% of how we actually work. So I build most of our internal tools instead, and AI is what makes that the faster option."
category: Government
date: 2026-10-10
published: false
---

I run IT for a small town in New Mexico. There are two of us, eight sites, and a police department that never closes. Over the last couple of years I've settled into building most of our internal tools myself instead of buying them.

People ask why. For me it comes down to three things.

**Off-the-shelf software is built one-size-fits-all.** That means it fits our actual process maybe 70% of the way, and then you spend the rest of your life working around the other 30%. Every workaround is a sticky note, a spreadsheet, or a step somebody has to remember.

**It costs more.** Licensing a product usually costs more than building the tool and running it on hardware we already own.

**Building is now faster than buying.** This is the one that changed. With AI handling most of the grunt work on the code side, building something that fits is usually quicker than buying someone else's product and configuring it to almost fit.

## Onboarding and offboarding: the checklist that had to go

The latest one is employee onboarding and offboarding automation, along with employee equipment tracking.

For a long time this was a checklist I ran by hand across eight different systems. A couple of them don't even have an API, so part of the job was clicking through admin portals. Doing things that way means you eventually miss a step. Miss one on an offboarding and somebody who doesn't work here anymore still has access to something. Miss one on an onboarding and a new hire gets held up waiting on me.

So I built it into one intake form:

1. HR or the department head fills it out and sends the request.
2. IT reviews the request and hits one button.
3. The app creates accounts across all the systems, assigns the right group memberships, and adds the person to the staff directory on the town website.
4. IT enters the device serial numbers and gets the employee's signature, and the app produces the signed equipment form for HR.

Every action gets logged. Our IT Specialist runs it now, and I haven't done one by hand in about a month, which feels great.

The convenience is nice. The part I care about as the security person is offboarding. Forgotten accounts are how small organizations get hurt, and a two-person team juggling eight systems is exactly where they pile up. When offboarding runs from the same record that created the accounts, nothing gets missed.

## Records: one document platform, three ways in

The bigger system is the one behind public records.

At the center is an internal document platform that holds the town's documents: ordinances, agendas, packets, minutes, and the records we release in response to requests. Everything lands there through the same intake, whether it's uploaded directly, imported from the old website, or attached to a meeting on the town site. Each document is stored once, gets one ID, and is indexed for search. It also reasons over every document: it pulls out entities like places, names, dates, and organizations and cross-references them across the whole archive. For ordinances and resolutions it maps how they relate to each other, meaning what amends what and what repealed what. The long-term goal is to use that to codify Edgewood's ordinances and resolutions into a real municipal codebook instead of a loose collection of documents. We're not there yet, but the platform already understands how the town's laws connect, and that's the hard part.

Around it are three tools, and they all point at that same platform:

- **The public records portal** ([records.edgewood-nm.gov](https://records.edgewood-nm.gov)) is the public window onto it. You can browse past requests and what was released for them. When someone starts typing a new request, AI looks at past requests to see whether one of them already answers the question.
- **The IPRA fulfillment tools** are internal and used by the town clerk. When the clerk fulfills a request, the responsive records are emailed to the requester *and* published on the portal at the same moment. That second half is the point: the next person with a similar question may find the answer before they ever submit a request.
- **The AI assistant on the town website** ([edgewood-nm.gov](https://edgewood-nm.gov)) answers residents' questions from the town's own published content, and it uses the same document intelligence the internal tools do.

Every release moves us toward one less request being sent.

All of the AI in this picture is local-first. It runs on our own hardware, a pair of mirrored NVIDIA DGX Sparks serving an open-weights model, load-balanced with session pinning so a conversation stays on one node and either machine can carry the load alone. Anthropic's cloud is a backstop, and it's fenced by data classification: only information that's public or releasable under IPRA can ever be processed there. Anything CJIS-sensitive, personnel-related, attorney-client privileged, or otherwise confidential never leaves town infrastructure.

The lesson that keeps this honest is that every piece of information has one home, and everything else is a copy that gets checked against it. The website is the source of truth for the assistant, and the assistant's index is reconciled against the site every hour. Before I built that reconciliation, the assistant was cheerfully citing a test meeting that had been deleted and staff who had already left. On an official town website, a wrong answer is a trust problem, not just a bug.

## The pattern: find the spreadsheet

The other move I keep making is to find whatever someone is tracking in a spreadsheet or an email chain and turn it into a web app built for that exact job. The most recent two are a kanban-board bill tracker for Finance and a training-hours tracker for the police department.

None of these are big systems. Each one takes something a person was holding together by hand and turns it into a tool. For a two-person department, that's the only way the math works.

## Should you build instead of buy?

Not always. If a product fits your process and the price is fair, buy it. But if you're a small organization paying for something that fits 70% and staffing the other 30% with workarounds, look at it again. The cost of building has dropped a lot, and the tool that fits your process exactly is usually the one you build yourself.
