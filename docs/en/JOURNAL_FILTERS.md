# Research journal filters (1.1.0-dev9)

Filters are read-only views and do not change stored data. Filters are remembered per tree and tab within the current browser app session and reset when switching trees.

Tasks: text/Q, person, status (planned/in progress/waiting verification/done/rejected). Historical uppercase DONE is normalized. Searches: text and outcome. Evidence: text and evidence status. Proposals: text and review status. History: text and action type (history has no task status). P/F/Q archive: text, person, record type, status/verification; records without status remain under All statuses. Media: text/person; statistics: aggregate only.

Filtering runs before the display cap. The native ZIP v2 and separate journal JSON v1 formats remain unchanged.
