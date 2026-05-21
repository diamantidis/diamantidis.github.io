---
layout: tips
title: "Convert CSV to JSON with jq"
description: Transform CSV data into JSON using jq and query it for quick analysis on the command line
date: 2026-05-21 06:00 +0200
tags: ["Command Line", "jq"]
image:
    path: /assets/social/tips/csv-to-json-with-jq.png
    width: 1024
    height: 441
twitter:
    card: summary_large_image
---

Recently, while working on a task to bulk-import data from a CSV file, I was looking for an easy (CLI) way to analyze and query the data before writing the import script. Having been spoiled by [jq], I was happy to find that it also supports transforming CSV into JSON, and that's what I'm going to present in this tip.

Let's say you have a CSV file named `exercises.csv` with exercise data:

```text
name,muscle_group,description,difficulty
Push-up,Chest,Lower the body by bending the arms and push back up,Beginner
Pull-up,Back,Lift the body by pulling up on a fixed bar,Intermediate
Squat,Legs,Lower the hips from a standing position and stand back up,Beginner
Overhead Press,Shoulders,Press a weight overhead from shoulder level,Intermediate
Bench Press,Chest,Lower a barbell to the chest and press it back up,Intermediate
Deadlift,Legs,Lift a loaded barbell from the ground to hip level,Advanced
```

## Convert CSV to JSON

To transform the CSV into JSON, run:

```sh
jq -Rn '
  {exercises: [
    input | inputs | split(",")
    | {
        name: .[0], 
        muscle_group: .[1], 
        description: .[2], 
        difficulty: .[3]
      }
  ]}
' < exercises.csv
```

This produces:

```json
{
  "exercises": [
    {
      "name": "Push-up",
      "muscle_group": "Chest",
      "description": "Lower the body by bending the arms and push back up",
      "difficulty": "Beginner"
    },
    {
      "name": "Pull-up",
      "muscle_group": "Back",
      "description": "Lift the body by pulling up on a fixed bar",
      "difficulty": "Intermediate"
    }
  ]
}
```

*(output truncated for brevity)*

Here's what each part does:

**Flags:**
- `-R` reads raw input (not JSON)
- `-n` don't read input automatically (we use `inputs` instead)

**Expression:**
- `{exercises: [...]}` wraps the result in an object with an `exercises` key (choose any name you like)
- `input` reads and discards the first line (the CSV header)
- `inputs` reads each remaining line
- `split(",")` splits each line on commas into an array
- `.[0]`, `.[1]`, `.[2]`, `.[3]` access the array elements by index, which are then mapped to named JSON keys

## Analyze the data

Once you have the data in JSON format, jq becomes a powerful query tool. For example, to count exercises by difficulty:

```sh
jq -Rn '[input | inputs | split(",") | {name: .[0], muscle_group: .[1], description: .[2], difficulty: .[3]}] | group_by(.difficulty) | map({difficulty: .[0].difficulty, count: length})' < exercises.csv
```

Output:

```json
[
  {
    "difficulty": "Beginner",
    "count": 2
  },
  {
    "difficulty": "Intermediate",
    "count": 3
  },
  {
    "difficulty": "Advanced",
    "count": 1
  }
]
```

This approach is useful whenever you need a quick way to inspect, filter, or summarize tabular data without reaching for a full scripting language.

Thanks for reading! If you found this tip useful, consider [buying me a coffee] to support the blog. For questions or comments, feel free to reach out on [X]!

Until next time!

[jq]: https://stedolan.github.io/jq/
[buying me a coffee]: https://www.buymeacoffee.com/diamantidis
[X]: https://x.com/diamantidis_io
