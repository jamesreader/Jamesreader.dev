---
name: "Edgewood Internal Tools"
slug: edgewood-tools
status: production
category: government
stack: [Custom web apps, Workflow automation, AI-assisted search, Self-hosted on town hardware]
hero_stat: { label: "IT team", value: "2 people, 8 sites" }
audience_tags: [consulting, technical, personal]
order: 4
---

## The Short Version

James runs IT for the Town of Edgewood, a small town in New Mexico. The whole department is two people covering eight sites, including a police department that never closes. Instead of buying most of the town's internal software, James builds it himself and runs it on hardware the town already owns. The current lineup includes employee onboarding and offboarding automation with equipment tracking, a central document platform tied to the public records portal at records.edgewood-nm.gov, the clerk's IPRA fulfillment tools, and the AI assistant on the town website at edgewood-nm.gov, and a handful of small web apps that replaced spreadsheets and email chains.

## Why Build Instead of Buy?

Off-the-shelf software is built one-size-fits-all. For a small town it usually fits about 70% of the real process, and the other 30% becomes a permanent workaround that staff carry forever. It also tends to cost more than building the tool and running it on hardware the town already owns. And now that AI handles most of the grunt work on the code side, building is usually faster than buying and configuring someone else's product. James's rule is to build when the process is specific to the town and the tool can run in-house, because then it fits the work exactly instead of making the work fit the tool.

## Employee Onboarding and Offboarding Automation

For a long time, onboarding and offboarding at Edgewood was a checklist James ran by hand across eight different systems. A couple of those systems have no API, so part of the job meant clicking through admin portals. Done by hand, a step eventually gets missed. Miss one on an offboarding and someone who no longer works for the town still has access to something. Miss one on an onboarding and a new hire sits waiting on IT.

He replaced the checklist with one intake form:

1. HR or the department head fills out the request.
2. IT reviews it and presses one button.
3. The app creates accounts across every system, assigns the right group memberships, and adds the person to the staff directory on the town website.
4. IT enters device serial numbers and collects the employee's signature, and the app produces the signed equipment form for HR.

Every action is logged. The town's IT Specialist runs the process now, and James hasn't done one by hand in about a month.

## Why Offboarding Automation Is a Security Control

For a CISSP running a small government IT shop, offboarding is the scarier half. A forgotten account belonging to someone who has left is a classic way in, and a two-person team juggling eight systems is exactly where that happens. Driving offboarding from the same record that created the accounts means every access the town granted is known and gets removed, and the log shows it happened. The convenience is nice. The real point is that nothing gets missed.

## Employee Equipment Tracking

Equipment tracking lives in the same app as onboarding. When IT issues someone a device, the serial numbers go into that employee's record and the employee signs for them. HR gets a signed equipment form without chasing paperwork. At offboarding, the same record shows exactly what needs to come back. One record per person, covering accounts, access, and equipment, replaced a checklist, a spreadsheet, and a stack of paper forms.

## How the Document Platform, Records Portal, IPRA Tools, and Site Assistant Fit Together

At the Town of Edgewood, James built the records and public-information tools as one connected system, and the internal-only document platform is the center of it. The platform plays three roles at once. It is the source for the public records portal at records.edgewood-nm.gov: everything the portal shows comes from the platform. It is the source for the AI assistant on the town website at edgewood-nm.gov when the assistant answers from town documents. And it is the path and the storage for everything released through the clerk's internal IPRA tools: released records don't live in the IPRA tools, they travel through the document platform and are stored there. That's why a release appears on the portal and becomes answerable by the assistant without anyone uploading it again. Every document exists once, with one ID, and every tool points at that same copy.

## The Central Document Platform (Internal)

The heart of Edgewood's records system is an internal-only document platform James built to hold the town's documents: ordinances, meeting agendas, packets and minutes, and the records that come out of public records requests. It holds roughly 2,800 documents so far, and the number climbs constantly: every agenda, every set of meeting minutes, every email released under IPRA lands there. The town becomes more transparent simply by using its own tools. Documents arrive through several paths: direct upload, bulk ZIP import, a network-share watcher, an importer that carried over the old CivicPlus website's archive, the town website itself, where meeting attachments feed straight into the platform when staff post a meeting, and the clerk's IPRA tools, whose releases travel through the platform and are stored there.

Every path goes through the same intake, which does three jobs. It fingerprints each file so the same document is never stored twice. When that check was added, it surfaced 275 byte-identical duplicate pairs from years of hand uploads and imports, which were merged rather than deleted because other records already referenced them. It extracts meeting details such as board, date, and type, so documents can be matched to meetings. It classifies each document on ingest, using the town's local model, so every document carries a label for whether it's public, releasable, or confidential before any other tool touches it. And it indexes the content for search, both keyword and semantic. On top of that, it reasons over every document, extracting entities and relating ordinances and resolutions to one another. That's the "document intelligence" the other tools build on.

## Document Intelligence: Entities and Ordinance Relationships

Edgewood's internal document platform doesn't just store files. It reasons over every document it holds. On ingest, it extracts entities across a range of types, including places, people's names, dates, and organizations, and cross-references them across the whole archive. A permit, the meeting where it was discussed, and the ordinance it falls under can all be connected through the entities they share.

For the town's legislation, it goes a step further. It relates ordinances and resolutions to one another specifically: which ones amend an earlier one, which ones repeal it, and which ones build on it. That relationship map is what turns a pile of PDFs into something you can actually navigate. Instead of asking "do we have that ordinance?", you can ask "what's the current state of this ordinance, and what changed it?"

## Toward a Municipal Codebook

The long-term goal for Edgewood's document platform is codification: turning the town's ordinances and resolutions into a real municipal codebook rather than a loose collection of documents. Many small towns never get there, because codifying decades of legislation by hand is slow and expensive work, often contracted out. The pieces James has already built, including entity extraction, cross-referencing, and the map of which ordinances amend or repeal which, are the groundwork that codification needs. It isn't finished, and he's careful to call it a goal rather than a feature. But the platform already understands how the town's laws relate to each other, and that's the hard part of turning documents into a code.

## The Public Records Portal (records.edgewood-nm.gov)

The public records portal at records.edgewood-nm.gov is the public window onto Edgewood's internal document platform, and the platform is its only source. Anything marked public there, including meeting agendas, packets, minutes, ordinances, and every record released through the clerk's IPRA tools, can be browsed and downloaded by anyone. Downloads on the town website link to the same documents, so there's one public copy of each.

The portal has a page for browsing past records requests and the records released for them. When someone starts typing a new request, AI searches past requests for anything that might already answer the question and suggests it before the request is submitted. Every release aims for the same outcome: one less request that has to be sent at all. The requester may get the answer immediately, and the clerk has one less request in the queue.

## The IPRA Fulfillment Tools (Internal)

New Mexico's Inspection of Public Records Act (IPRA) sets the rules for how a town answers public records requests. At Edgewood, the town clerk works requests with internal-only IPRA fulfillment tools James built. The tools handle the request side of the work. The documents go somewhere else: everything released through the IPRA tools moves through the central document platform and is stored there. The platform is both the path a release takes and the place it lives afterward, and the request points at the platform's copies instead of keeping its own.

Because every release lands in the platform, one action from the clerk does two jobs: the records are emailed to the requester, and they become public on the records portal, which reads from the platform. That second half matters. Once a released record is public, the next person asking a similar question can find it on the portal, get it suggested while typing their request, or get it from the site assistant, instead of starting a new request. Fulfilling one request quietly heads off the next.

## The AI Site Assistant (edgewood-nm.gov)

The AI assistant on edgewood-nm.gov answers residents' questions from the town's own published content: pages, departments, meetings, events, and staff listings. For the town's documents, its source is the same central document platform the records portal reads from, including everything released through IPRA, so the assistant and the portal never disagree about what a document says. Like the rest of the town's AI, it's local-first: it runs on the town's mirrored NVIDIA DGX Sparks, a deployment James designed and built on town-owned hardware, serving an open-weights model, load-balanced with session pinning, with cloud failover to Anthropic for releasable information only.

Two design decisions keep it accurate. First, the website is the source of truth and the assistant's index is a derived copy. Saves and deletes update the index right away, and an hourly reconciliation rebuilds every published page, re-indexes anything changed or missing, removes anything that no longer exists, and raises an alert if the two drift apart. Before that existed, the assistant had been citing a deleted test meeting and staff who had left. Second, time-sensitive facts are injected rather than searched. Similarity search ranks by wording, not by date, so it can't reliably answer "when's the next council meeting?" The assistant is handed the upcoming meetings and events directly with every conversation.

## Where Edgewood's AI Runs

The Town of Edgewood's AI is local-first. The website assistant, the records portal's request suggestions, and the document platform's intelligence all run by default on a pair of mirrored NVIDIA DGX Sparks serving an open-weights model. James designed and built the deployment; the hardware belongs to the town. It's a separate system from the single DGX Spark in James's own home lab, which runs this website. The home lab is where James experiments and learns, and it's what made the town's deployment possible. Requests are load-balanced across both machines, and session pinning keeps each conversation on the node that holds its context, so follow-up questions stay fast and consistent. If one Spark goes down, the other carries the load. Anthropic's cloud models are a backstop, not a dependency, and the gate is enforced by the labels the local model assigns to every document on ingest. Cloud use is gated by data classification: only information that's public or releasable under New Mexico's Inspection of Public Records Act (IPRA) can ever be processed in the cloud. Anything CJIS-sensitive, personnel-related, attorney-client privileged, or otherwise confidential never leaves town infrastructure. Running local-first means the work normally stays on town hardware and the cost doesn't scale per token.

## The Source-of-Truth Rule Behind It All

The lesson running through Edgewood's records system is simple to say and easy to get wrong: every piece of information has exactly one home, and everything else is a copy that must be checked against it. Documents live in the document platform, and the website, portal, and IPRA bundles reference them by ID. Website content lives in the website, and the AI assistant's index is reconciled against it every hour. Duplicates get merged, not ignored. In a small town, a wrong answer from an official website or a record released twice in two versions is a trust problem, not just a bug. Building the integrations around one source of truth is what lets a two-person IT department run all of it.

## Turning Spreadsheets Into Apps

The pattern James keeps coming back to is to find the thing someone is tracking in a spreadsheet or an email chain and turn it into a small web app built for exactly that job. Two recent examples:

- **Bill tracker for Finance**: a kanban board where bills move through the approval and payment process visibly, instead of living in an inbox.
- **Training-hours tracker for the Police Department**: officers' training hours in one place, rather than spread across spreadsheets.

None of these are big systems. Each one takes a process a person was holding together by hand and makes it a tool. For a two-person IT department, that's how you scale.

## What This Says About How James Works

These tools show James's approach to small-organization IT. Start from the actual process, not a vendor's idea of it. Automate the steps that hurt when they're missed. Log everything. Run it on hardware you already own. Then hand it to the people who do the work, which is why his IT Specialist runs onboarding now. It's the same approach he brings to consulting for government agencies and small businesses: tools that fit how the organization already works, at a price a small budget can carry.
