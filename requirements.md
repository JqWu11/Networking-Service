# Requirements Document

## 1. Project Overview

This project delivers a web-based networking outreach assistant for job seekers. The workflow starts when a user inputs some or all LinkedIn information for a target contact (for example: LinkedIn URL, role, experience notes, hobbies, volunteering details, and interests). The system analyzes that input, extracts keywords, generates targeted outreach templates (career-focused, hobby-focused, volunteering-focused), and uses an email sender to automatically schedule outbound emails.

The primary value is reducing networking anxiety and decision fatigue for users with limited professional-networking experience while increasing consistency and quality of outreach.

## 2. Problem Statement

Current tools (LinkedIn messaging, email clients, CRMs, and spreadsheets) each solve only part of the networking workflow:
- LinkedIn and email support sending messages but do not provide complete outreach workflow support.
- CRMs are often too complex for individual job seekers.
- Spreadsheets and notes require manual effort and offer no guided personalization.

The system must provide a lightweight, structured, and user-friendly alternative designed for job-seeker use cases.

## 3. Target Users and User Context

### 3.1 Primary Users
- First-generation college students
- Career changers
- International students
- Other job seekers with limited existing networks

### 3.2 User Context Requirements
- Users may be unfamiliar with U.S. networking norms.
- Users need simple guidance and transparent progress visibility.
- Users benefit from templates, but messages must still feel personal and authentic.

## 4. Product Goals and Success Metrics

### 4.1 Goals
- Help users organize outreach end-to-end in one place.
- Improve personalization quality over copy-paste messaging.
- Reduce the time and cognitive effort required to perform networking outreach.

### 4.2 Success Metrics
- Reduced time required to send personalized outreach.
- Number of contacts actively tracked by users.
- User-reported confidence when networking.
- Personalization rate of sent messages versus generic copy-paste messages.

## 5. Scope

### 5.1 In Scope (MVP)
- Input form for partial or full LinkedIn contact/profile information
- Keyword extraction from user-provided LinkedIn data (experience, hobbies, volunteering, interests)
- Automatic generation of multiple personalized template variants by focus area
- Integrated email sender that automatically schedules and queues outreach messages
- Dashboard for delivery states, follow-ups, and response tracking

### 5.2 Out of Scope (Initial Version)
- Enterprise CRM features (multi-team sales pipelines, advanced forecasting, etc.)
- Full social-network replacement capabilities
- Advanced AI-generated outreach requiring external model orchestration
- Guaranteed LinkedIn scraping beyond legal/API-compliant profile URL metadata workflows

## 6. Functional Requirements

Each requirement is labeled with priority:
- `MUST`: required for MVP
- `SHOULD`: strong post-MVP candidate
- `COULD`: optional enhancement

### 6.1 Contact Management
- **FR-1 (MUST)**: The system must allow users to input some or all available LinkedIn information for a target contact.
- **FR-2 (MUST)**: A contact record must support name, role/title, company, LinkedIn URL, work experience notes, hobbies, volunteering details, and outreach status.
- **FR-3 (MUST)**: The system must support contact status tracking (e.g., info added, keywords extracted, templates generated, queued, sent, replied, follow-up due).
- **FR-4 (SHOULD)**: The system should support tags/labels for grouping contacts by outreach objective.

### 6.2 Message Personalization and Templates
- **FR-5 (MUST)**: The system must extract relevant keywords from entered LinkedIn information, including work experience, hobbies, and volunteering.
- **FR-6 (MUST)**: The system must generate multiple example outreach templates from extracted keywords, including career-focused, hobby-focused, and volunteering-focused variants.
- **FR-7 (MUST)**: Generated templates must automatically personalize to the selected contact details.
- **FR-8 (SHOULD)**: Users should be able to review and edit generated content before final send.

### 6.3 Outreach Scheduling and Sending
- **FR-9 (MUST)**: The system must automatically schedule generated outreach emails using configurable send timing.
- **FR-10 (MUST)**: The system must support at least one email integration path (e.g., Gmail API or SendGrid) for message delivery.
- **FR-11 (MUST)**: The system must display send status for each message (queued, scheduled, sent, failed, canceled).
- **FR-12 (SHOULD)**: The system should support rescheduling and cancellation for queued messages.

### 6.4 Tracking and Follow-Up
- **FR-13 (MUST)**: The system must track conversation/outreach history per contact.
- **FR-14 (MUST)**: The system must allow users to log replies and follow-up actions.
- **FR-15 (MUST)**: The system must surface pending follow-ups in a clear queue/list.
- **FR-16 (SHOULD)**: The system should provide reminder prompts for follow-up deadlines.

### 6.5 Dashboard and Workflow Support
- **FR-17 (MUST)**: The product must provide a dashboard showing contact pipeline state, extracted keyword categories, generated templates, and upcoming sends.
- **FR-18 (MUST)**: Users must be able to move from LinkedIn info input to keyword extraction, template generation, and automatic scheduling in one guided flow.
- **FR-19 (SHOULD)**: Dashboard views should support filtering by status, company, role, and follow-up date.
- **FR-20 (COULD)**: Dashboard may include lightweight progress analytics over time.

## 7. Non-Functional Requirements

### 7.1 Usability and Accessibility
- **NFR-1 (MUST)**: UI must prioritize clarity for novice users through simple navigation and plain-language labels.
- **NFR-2 (MUST)**: Core workflows (add contact, personalize, schedule, track) must be completable without external documentation.
- **NFR-3 (SHOULD)**: UI should follow accessibility best practices for forms, keyboard navigation, and text contrast.

### 7.2 Performance and Reliability
- **NFR-4 (MUST)**: Common dashboard actions should feel responsive under normal class-project usage.
- **NFR-5 (MUST)**: Failed send/sync operations must return clear user-visible error states and recovery actions.
- **NFR-6 (SHOULD)**: Keyword extraction and scheduling logic should be resilient to transient API/network failures with retry strategy.

### 7.3 Privacy and Security
- **NFR-7 (MUST)**: Sensitive integration credentials must not be hardcoded in client code.
- **NFR-8 (MUST)**: User contact/message data must be stored and transmitted using secure project-standard practices.
- **NFR-9 (MUST)**: The system must store only minimum necessary LinkedIn-derived data required for personalization and sending.

### 7.4 Maintainability
- **NFR-10 (MUST)**: Frontend, backend, and integration responsibilities must be modular to support parallel team development.
- **NFR-11 (SHOULD)**: Key workflows should include automated tests or repeatable test scripts.

## 8. Technical Constraints and Dependencies

- Web application stack based on React and JavaScript.
- Parsing/keyword extraction logic required for user-entered LinkedIn profile content.
- Persistent database required for contacts, extracted keywords, templates, message state, and activity logs.
- Email integration required through Gmail API, SendGrid, or equivalent approved provider.
- GitHub used for version control and issue tracking.
- Slack and Google Docs/Sheets used for team communication, planning, and timeline management.

## 9. Data Model Requirements

Minimum entities:
- **User**: account/profile and settings (if authentication is implemented)
- **Contact**: identity, metadata, source, LinkedIn information fields, tags, pipeline status
- **ExtractedKeywordSet**: categorized profile keywords (career, hobbies, volunteering, interests)
- **Template**: generated outreach variants by focus type with placeholders
- **OutreachMessage**: personalized content, channel, auto-schedule, delivery status
- **InteractionLog**: sent/reply/follow-up events and timestamps
- **ReminderTask**: pending follow-up actions and due dates

Data behaviors:
- LinkedIn input updates and extracted keyword outputs must be recorded per contact.
- Contact status transitions must be recorded.
- Message and interaction history must be traceable by contact.
- Scheduled items must support lifecycle updates (create, update, cancel, send, fail).

## 10. External Integrations and Assumptions

### 10.1 Required Integration
- Email sending integration via one provider (Gmail API or SendGrid) is required for MVP.

### 10.2 Conditional/Exploratory Integration
- LinkedIn profile URL-based enrichment is exploratory and depends on policy-compliant integration methods.

### 10.3 Assumptions
- API rate limits and quotas will constrain message throughput.
- Integration failures are expected and must be surfaced clearly.
- Users may provide complete or incomplete LinkedIn information, and template quality depends on provided detail.
- Automatic scheduling rules can be configured by user or campaign defaults.

## 11. Risks and Mitigations

- **Risk**: API limits or outages impact sending.
  - **Mitigation**: queueing, retry rules, visible failure states, and manual resend paths.
- **Risk**: Personalization quality feels generic/robotic.
  - **Mitigation**: keyword-based template variants (career, hobby, volunteering) plus optional user edits.
- **Risk**: Incomplete LinkedIn input reduces personalization quality.
  - **Mitigation**: prompt users for missing details and provide confidence indicators on generated templates.
- **Risk**: Scope expansion beyond course timeline.
  - **Mitigation**: strict MVP boundaries and weekly scope review.

## 12. Milestones and Phase Alignment

Phases (from project plan):
1. Startup and Team Education
2. User Requirements and Context Design
3. Solution Development
4. System Integration
5. Testing and Evaluation
6. Redesign and Improvements
7. Final Reporting

Requirement alignment guidance:
- Phases 1-2: validate user workflows, finalize MVP scope, define data schema.
- Phases 3-4: build core features (FR-1 through FR-18), keyword extraction pipeline, and email sender integration.
- Phase 5: test functional flows, reliability scenarios, and usability criteria.
- Phase 6: implement high-impact improvements from testing outcomes.
- Phase 7: produce final metrics, lessons learned, and reporting artifacts.

## 13. Team Responsibilities (Current Plan)

- **Justin Wu**: backend and integration ownership; system design alignment.
- **Aryan Kumar**: dashboard/frontend UX ownership.
- **Garv Virginkar**: backend data modeling and organizational support.

Collaboration expectation: feature-based structure enabling parallel frontend, backend, and integration work with clear ownership boundaries.

## 14. Acceptance Criteria and Validation Checklist

MVP is acceptable when all criteria below are met:
- Users can input partial or full LinkedIn information and create/manage contact records.
- Users can generate targeted templates (career/hobby/volunteering) from extracted keywords.
- Users can automatically schedule emails and see accurate delivery state.
- Users can log replies and track follow-up tasks from one dashboard.
- End-to-end workflow is usable by novice users without relying on external tools.
- Core failure cases (input/extraction errors, API errors, scheduling failures) show understandable recovery paths.
- Project team can demonstrate measurable progress against listed success metrics.

## 15. Open Questions for Future Revision

- Authentication and account model scope for final release.
- Final email provider decision and fallback strategy.
- Deployment target/environment and operational constraints.
- Depth of analytics included beyond MVP dashboard visibility.

