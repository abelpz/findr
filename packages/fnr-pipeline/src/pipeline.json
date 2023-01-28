[
  {
    "id": 0,
    "type": "Inputs",
    "inputs": {
      "perf": "json",
      "params": "json"
    }
  },
{
    "id": 4,
    "title": "Transform 4",
    "name": "verseWords",
    "type": "Transform",
    "transformName": "verseWords",
    "inputs": [
      {
        "name": "perf",
        "type": "json",
        "source": "Input perf"
      }
    ],
    "outputs": [
      {
        "name": "verseWords",
        "type": "json"
      }
    ],
    "description": "PERF=>JSON: Counts words occurrences"
  },
  {
    "id": 6,
    "title": "Strip Alignment",
    "name": "stripAlignment",
    "type": "Transform",
    "transformName": "stripAlignment",
    "inputs": [
      {
        "name": "perf",
        "type": "json",
        "source": "Input perf"
      },
      {
        "name": "verseWords",
        "type": "json",
        "source": "Transform 4 verseWords"
      }
    ],
    "outputs": [
      {
        "name": "perf",
        "type": "json"
      },
      {
        "name": "strippedAlignment",
        "type": "json"
      },
      {
        "name": "unalignedWords",
        "type": "json"
      }
    ],
    "description": "PERF=>PERF: Strips alignment markup"
  },
  {
    "id": 9,
    "title": "Merge stripped perf",
    "name": "mergePerfText",
    "type": "Transform",
    "transformName": "mergePerfText",
    "inputs": [
      {
        "name": "perf",
        "type": "json",
        "source": "Transform 6 perf"
      }
    ],
    "outputs": [
      {
        "name": "perf",
        "type": "json"
      }
    ],
    "description": "PERF=>PERF: Merge consecutive text strings"
  },



    {
    "id": 20,
    "title": "searchReplace",
    "name": "searchReplace",
    "type": "Transform",
    "transformName": "searchReplace",
    "inputs": [
      {
        "name": "perf",
        "type": "json",
        "source": "Transform 9 perf"
      },
      {
        "name": "params",
        "type": "json",
        "source": "Input params"
      }
    ],
    "outputs": [
      {
        "name": "perf",
        "type": "json"
      },
      {
        "name": "results",
        "type": "json"
      }
    ],
    "description": "Search the given phrase or regex"
  },

  {
    "id": 12,
    "title": "Count stripped perf words",
    "name": "verseWords",
    "transformName": "verseWords",
    "type": "Transform",
    "inputs": [
      {
        "name": "perf",
        "type": "json",
        "source": "Transform 20 perf"
      }
    ],
    "outputs": [
      {
        "name": "verseWords",
        "type": "json"
      }
    ],
    "description": "PERF=>JSON: Counts words occurrences"
  },
  {
    "id": 13,
    "title": "Merge Back Into Stripped (roundtrip)",
    "name": "mergeAlignment",
    "transformName": "mergeAlignment",
    "type": "Transform",
    "inputs": [
      {
        "name": "perf",
        "type": "json",
        "source": "Transform 20 perf"
      },
      {
        "name": "strippedAlignment",
        "type": "json",
        "source": "Transform 6 strippedAlignment"
      },
      {
        "name": "verseWords",
        "type": "json",
        "source": "Transform 12 verseWords"
      }
    ],
    "outputs": [
      {
        "name": "perf",
        "type": "json"
      },
      {
        "name": "unalignedWords",
        "type": "json"
      }
    ],
    "description": "PERF=>PERF adds report to verses"
  },
  {
    "id": 17,
    "title": "Merge Merged PERF Text",
    "name": "mergePerfText",
    "transformName": "mergePerfText",
    "type": "Transform",
    "inputs": [
      {
        "name": "perf",
        "type": "json",
        "source": "Transform 13 perf"
      }
    ],
    "outputs": [
      {
        "name": "perf",
        "type": "json"
      }
    ],
    "description": "PERF=>PERF: Merge consecutive text strings"
  },
  {
    "id": 999,
    "type": "Outputs",
    "outputs": [
      {
        "name": "perf",
        "type": "json",
        "source": "Transform 17 perf"
      },
      {
        "name": "unalignedWords",
        "type": "json",
        "source": "Transform 13 unalignedWords"
      },
      {
        "name": "results",
        "type": "json",
        "source": "Transform 20 results"
      }
    ]
  }
]
