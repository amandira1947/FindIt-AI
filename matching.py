
import re
from difflib import SequenceMatcher


def clean_text(text):
    """Convert text into lowercase words."""

    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)

    return " ".join(text.split())


def text_similarity(text1, text2):
    """Compare two descriptions."""

    first = clean_text(text1)
    second = clean_text(text2)

    if not first or not second:
        return 0

    # Compare complete sentences
    sentence_score = SequenceMatcher(
        None, first, second
    ).ratio()

    # Compare common words
    words1 = set(first.split())
    words2 = set(second.split())

    common = words1.intersection(words2)
    total = words1.union(words2)

    word_score = len(common) / len(total) if total else 0

    # Combine both scores
    score = (
        0.6 * sentence_score +
        0.4 * word_score
    )

    return round(score * 100, 2)


def calculate_match(lost, found):

    # Compare item names and descriptions
    lost_text = (
        lost["item_name"] + " " +
        lost["description"]
    )

    found_text = (
        found["item_name"] + " " +
        found["description"]
    )

    text_score = text_similarity(
        lost_text,
        found_text
    )

    # Compare categories
    category_score = (
        100 if clean_text(lost["category"])
        == clean_text(found["category"])
        else 0
    )

    # Compare locations
    location_score = text_similarity(
        lost["location"],
        found["location"]
    )

    # Final weighted score
    final_score = (
        0.65 * text_score +
        0.20 * category_score +
        0.15 * location_score
    )

    return {
        "text_score": round(text_score, 2),
        "category_score": category_score,
        "location_score": round(location_score, 2),
        "match_score": round(final_score, 2)
    }


def find_matches(items):

    lost_items = [
        item for item in items
        if item["item_type"].lower() == "lost"
    ]

    found_items = [
        item for item in items
        if item["item_type"].lower() == "found"
    ]

    matches = []

    for lost in lost_items:

        for found in found_items:

            scores = calculate_match(lost, found)

            if scores["match_score"] >= 25:

                matches.append({
                    "lost_item": lost,
                    "found_item": found,
                    **scores
                })

    matches.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    return matches
