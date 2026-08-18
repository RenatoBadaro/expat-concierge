#!/usr/bin/env python3
"""Export V3 Assignment Risk Matrix to Excel for business review."""

from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

ONEDRIVE_OUT = Path(
    "/Users/renatobadaro/Library/CloudStorage/OneDrive-Anheuser-BuschInBev"
    "/Expat/expat-concierge/data/V3_Assignment_Risk_Matrix_v1.0.xlsx"
)
LOCAL_OUT = Path(__file__).resolve().parent.parent / "docs/V3_Assignment_Risk_Matrix_v1.0.xlsx"

MASTER_TASKS = [
    {"id": 1, "order": 1, "task": "Review and discuss the offer with Host line manager and Host PBP", "cat": "Offer", "slot": "90-120d", "condition": None, "owner": "Expat"},
    {"id": 2, "order": 2, "task": "Confirm offer acceptance", "cat": "Offer", "slot": "90-120d", "condition": None, "owner": "Expat"},
    {"id": 3, "order": 3, "task": "Have an Onboarding call with Global Mobility", "cat": "Onboarding", "slot": "90-120d", "condition": None, "owner": "GM"},
    {"id": 4, "order": 4, "task": "Review and sign the Letter of Assignment through DocuSign", "cat": "Letter of Assignment", "slot": "90-120d", "condition": None, "owner": "Expat"},
    {"id": 5, "order": 5, "task": "Have an Immigration briefing with Vialto", "cat": "Immigration", "slot": "90-120d", "condition": None, "owner": "Vialto"},
    {"id": 6, "order": 6, "task": "Gather and share personal Immigration documents required", "cat": "Immigration", "slot": "90-120d", "condition": None, "owner": "Expat"},
    {"id": 7, "order": 7, "task": "Schedule the Tax & Equity briefing with Home & Host Vialto Tax team", "cat": "Tax", "slot": "90-120d", "condition": "hasTaxConcerns", "owner": "Vialto"},
    {"id": 8, "order": 8, "task": "Have a briefing with K2 about your and family's needs in the Host location", "cat": "Destination Services", "slot": "90-120d", "condition": None, "owner": "K2"},
    {"id": 9, "order": 9, "task": "Plan the Look & See trip and align logistics with K2", "cat": "Destination Services", "slot": "90-120d", "condition": None, "owner": "K2"},
    {"id": 10, "order": 10, "task": "Review the final visa application package and confirm/submit the application", "cat": "Immigration", "slot": "90-120d", "condition": "hasImmigration", "owner": "Expat"},
    {"id": 11, "order": 11, "task": "Connect with Net Expat for Intercultural Training and Partner Support", "cat": "Destination Services", "slot": "60d", "condition": "needsIntercultural", "owner": "Net Expat"},
    {"id": 12, "order": 12, "task": "Attend the Look & See trip", "cat": "Destination Services", "slot": "60d", "condition": None, "owner": "Expat"},
    {"id": 13, "order": 13, "task": "Confirm the preferred living area at host with K2", "cat": "Destination Services", "slot": "60d", "condition": None, "owner": "Expat"},
    {"id": 14, "order": 14, "task": "Schedule pre-move survey for HHG shipment", "cat": "Destination Services", "slot": "60d", "condition": None, "owner": "K2"},
    {"id": 15, "order": 15, "task": "Submit school application", "cat": "Destination Services", "slot": "60d", "condition": "hasChildren", "owner": "Expat"},
    {"id": 16, "order": 16, "task": "Organise Pet Shipment", "cat": "Destination Services", "slot": "60d", "condition": "hasPets", "owner": "K2"},
    {"id": 17, "order": 17, "task": "Conduct final health check and identify any medical needs in the Host", "cat": "Healthcare", "slot": "60d", "condition": None, "owner": "Expat"},
    {"id": 18, "order": 18, "task": "Identify memberships/leases/etc that need to be reviewed/cancelled in Home country", "cat": "Departure", "slot": "60d", "condition": None, "owner": "Expat"},
    {"id": 19, "order": 19, "task": "Conduct the Packing of Household Goods with K2", "cat": "Departure", "slot": "60d", "condition": None, "owner": "K2"},
    {"id": 20, "order": 20, "task": "Organise Temporary Living in Home/Host with K2", "cat": "Destination Services", "slot": "60d", "condition": "needsTempHousing", "owner": "K2"},
    {"id": 21, "order": 21, "task": "Provide documents required for customs clearance", "cat": "Destination Services", "slot": "60d", "condition": None, "owner": "Expat"},
    {"id": 22, "order": 22, "task": "Receive Immigration confirmation and align with Vialto on post-arrival immigration", "cat": "Immigration", "slot": "30d", "condition": "hasImmigration", "owner": "Vialto"},
    {"id": 23, "order": 23, "task": "Book final move ticket after visa is issued", "cat": "Travel", "slot": "30d", "condition": None, "owner": "Expat"},
    {"id": 24, "order": 24, "task": "Relocate to the Host location with your family", "cat": "Travel", "slot": "30d", "condition": None, "owner": "Expat"},
    {"id": 25, "order": 25, "task": "Move into Temporary Housing", "cat": "Destination Services", "slot": "arrival", "condition": "needsTempHousing", "owner": "Expat"},
    {"id": 26, "order": 26, "task": "Open bank account in Host country", "cat": "Destination Services", "slot": "arrival", "condition": None, "owner": "Expat"},
    {"id": 27, "order": 27, "task": "Follow guidance from Vialto for any post-arrival immigration process", "cat": "Immigration", "slot": "arrival", "condition": "hasImmigration", "owner": "Vialto"},
    {"id": 28, "order": 28, "task": "Follow guidance from K2 for any post-arrival processes", "cat": "Destination Services", "slot": "arrival", "condition": None, "owner": "K2"},
    {"id": 29, "order": 29, "task": "Move into Permanent Housing", "cat": "Destination Services", "slot": "arrival", "condition": None, "owner": "Expat"},
    {"id": 30, "order": 30, "task": "Arrange Household Goods delivery", "cat": "Destination Services", "slot": "arrival", "condition": None, "owner": "K2"},
    {"id": 31, "order": 31, "task": "Schedule Language Training", "cat": "Destination Services", "slot": "arrival", "condition": "hasLanguageBarrier", "owner": "Expat"},
    {"id": 32, "order": 32, "task": "Register Cigna Envoy after receiving Cigna Welcome Email", "cat": "Healthcare", "slot": "arrival", "condition": None, "owner": "Expat"},
    {"id": 33, "order": 33, "task": "Review the drafted first host payroll with Global Mobility", "cat": "Payroll", "slot": "arrival", "condition": None, "owner": "GM"},
    {"id": 34, "order": 34, "task": "Organise local Onboarding with line manager and local PBP", "cat": "Onboarding", "slot": "arrival", "condition": None, "owner": "Expat"},
]

RISK_MATRIX = {
    "version": "1.0",
    "updated": "2026-08",
    "purpose": "Score incomplete action-log tasks by how much they block relocation or assignment completion.",
    "tiers": {
        "blocker": {"label": "Blocker", "weight": 5, "desc": "Hard gate — blocks move or assignment completion until resolved."},
        "critical": {"label": "Critical", "weight": 4, "desc": "Strong dependency on the critical path (visa, payroll, healthcare)."},
        "high": {"label": "High", "weight": 3, "desc": "Important for a successful move or settle-in."},
        "medium": {"label": "Medium", "weight": 2, "desc": "Supporting task — delays cause friction but rarely block alone."},
        "low": {"label": "Low", "weight": 1, "desc": "Optional / enrichment — minimal impact on assignment success."},
    },
    "gates": {
        "start": "Pre-move gate — must complete before package proceeds",
        "move": "Relocation gate — blocks physical move to host country",
        "settle": "Settle-in gate — blocks stable life in host country",
        "complete": "Completion gate — blocks formal assignment closure",
        "support": "Support — improves experience, rarely blocks alone",
    },
    "statusMultipliers": {"overdue": 2.0, "dueSoon": 1.35, "pending": 1.0},
    "levelThresholds": [
        {"level": "low", "label": "Low", "maxScore": 18},
        {"level": "medium", "label": "Medium", "maxScore": 40},
        {"level": "high", "label": "High", "maxScore": 65},
        {"level": "critical", "label": "Critical", "maxScore": 9999},
    ],
    "escalationRules": [
        "Any Blocker-tier task overdue → overall risk = Critical (regardless of score).",
        "Two or more Critical-tier tasks overdue → overall risk = Critical.",
        "Risk score = Σ (tier weight × status multiplier) for all incomplete tasks in the user's action log.",
        "Completed tasks contribute zero. Conditional tasks only apply when profile flags match.",
        "Higher weight on gates: move, settle, and complete — these block the end of the assignment journey.",
    ],
    "tasks": {
        1: {"tier": "high", "gate": "start", "note": "Offer discussion — precedes acceptance"},
        2: {"tier": "blocker", "gate": "start", "note": "Offer acceptance — blocks LOA and package"},
        3: {"tier": "medium", "gate": "start", "note": "GM onboarding — orientation, not a hard gate"},
        4: {"tier": "blocker", "gate": "start", "note": "Signed LOA — legal basis for assignment"},
        5: {"tier": "critical", "gate": "start", "note": "Immigration briefing — visa path begins"},
        6: {"tier": "critical", "gate": "start", "note": "Immigration documents — required for visa"},
        7: {"tier": "high", "gate": "start", "note": "Tax briefing (if applicable)"},
        8: {"tier": "medium", "gate": "support", "note": "K2 needs briefing — housing/school planning"},
        9: {"tier": "medium", "gate": "support", "note": "Look & See planning"},
        10: {"tier": "blocker", "gate": "move", "note": "Visa application submitted — blocks travel"},
        11: {"tier": "low", "gate": "support", "note": "Intercultural training (if applicable)"},
        12: {"tier": "medium", "gate": "support", "note": "Look & See trip attendance"},
        13: {"tier": "medium", "gate": "settle", "note": "Preferred area — feeds housing search"},
        14: {"tier": "high", "gate": "move", "note": "HHG survey — shipment timeline"},
        15: {"tier": "high", "gate": "settle", "note": "School application (if children)"},
        16: {"tier": "medium", "gate": "support", "note": "Pet shipment (if applicable)"},
        17: {"tier": "medium", "gate": "settle", "note": "Health check before move"},
        18: {"tier": "medium", "gate": "move", "note": "Home-country cancellations"},
        19: {"tier": "high", "gate": "move", "note": "HHG packing — physical move prep"},
        20: {"tier": "high", "gate": "settle", "note": "Temporary living (if applicable)"},
        21: {"tier": "high", "gate": "move", "note": "Customs documents — HHG clearance"},
        22: {"tier": "blocker", "gate": "move", "note": "Immigration confirmation — required before move"},
        23: {"tier": "blocker", "gate": "move", "note": "Book ticket after visa — cannot travel without"},
        24: {"tier": "blocker", "gate": "move", "note": "Relocate to host — core relocation gate"},
        25: {"tier": "high", "gate": "settle", "note": "Temporary housing check-in (if applicable)"},
        26: {"tier": "critical", "gate": "settle", "note": "Bank account — payroll and daily life"},
        27: {"tier": "critical", "gate": "settle", "note": "Post-arrival immigration compliance"},
        28: {"tier": "medium", "gate": "settle", "note": "K2 post-arrival processes"},
        29: {"tier": "blocker", "gate": "settle", "note": "Permanent housing — blocks stable settle-in"},
        30: {"tier": "medium", "gate": "settle", "note": "HHG delivery at host"},
        31: {"tier": "low", "gate": "support", "note": "Language training (if applicable)"},
        32: {"tier": "critical", "gate": "settle", "note": "Cigna registration — healthcare coverage"},
        33: {"tier": "critical", "gate": "complete", "note": "First host payroll review — compensation live"},
        34: {"tier": "blocker", "gate": "complete", "note": "Local onboarding — assignment operationally complete"},
    },
}

HEADER_FILL = PatternFill("solid", fgColor="0F3B4F")
HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
TITLE_FONT = Font(bold=True, size=14, color="0F3B4F")
SUB_FONT = Font(size=11, color="444444")
YELLOW_FILL = PatternFill("solid", fgColor="F4D21F")
EDIT_FILL = PatternFill("solid", fgColor="FFF9E6")
THIN = Side(style="thin", color="D1D5DB")


def style_header_row(ws, row, col_count):
    for c in range(1, col_count + 1):
        cell = ws.cell(row=row, column=c)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)


def auto_width(ws, max_width=60):
    for col in ws.columns:
        length = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.value:
                length = max(length, min(len(str(cell.value)), max_width))
        ws.column_dimensions[col_letter].width = min(max(length + 2, 10), max_width)


def build_workbook():
    wb = Workbook()

    # ── Sheet 1: Overview ──
    ws = wb.active
    ws.title = "Overview"
    ws["A1"] = "Expat Concierge V3 — Assignment Risk Matrix"
    ws["A1"].font = TITLE_FONT
    ws["A3"] = "Version"
    ws["B3"] = RISK_MATRIX["version"]
    ws["A4"] = "Last updated"
    ws["B4"] = RISK_MATRIX["updated"]
    ws["A5"] = "Purpose"
    ws["B5"] = RISK_MATRIX["purpose"]
    ws["A7"] = "How business should use this file"
    ws["A7"].font = Font(bold=True)
    instructions = [
        "1. Review the Task Matrix tab — validate Risk Tier, Gate, and Rationale for each of the 34 actions.",
        "2. Fill in BUSINESS REVIEW columns (yellow): suggested tier/gate and comments.",
        "3. Adjust Tier Weights / Risk Levels tabs if scoring thresholds need to change.",
        "4. Return the file to Tech — changes will be applied to RISK_MATRIX in expat-concierge-demo-v3.html.",
        "5. Blocker and Critical tiers on overdue tasks drive Critical risk in the demo UI.",
    ]
    for i, line in enumerate(instructions, start=8):
        ws.cell(row=i, column=1, value=line).font = SUB_FONT
    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 90

    # ── Sheet 2: Escalation Rules ──
    ws2 = wb.create_sheet("Escalation Rules")
    ws2["A1"] = "Escalation rules (auto-elevate overall risk)"
    ws2["A1"].font = TITLE_FONT
    for i, rule in enumerate(RISK_MATRIX["escalationRules"], start=3):
        ws2.cell(row=i, column=1, value=rule)
    auto_width(ws2)

    # ── Sheet 3: Tier Weights ──
    ws3 = wb.create_sheet("Tier Weights")
    headers = ["Tier key", "Label", "Weight", "Description", "BUSINESS: New weight"]
    ws3.append(headers)
    style_header_row(ws3, 1, len(headers))
    for key, tier in RISK_MATRIX["tiers"].items():
        ws3.append([key, tier["label"], tier["weight"], tier["desc"], None])
    for row in ws3.iter_rows(min_row=2, max_row=ws3.max_row, min_col=5, max_col=5):
        for cell in row:
            cell.fill = EDIT_FILL
    auto_width(ws3)

    # ── Sheet 4: Gate Types ──
    ws4 = wb.create_sheet("Gate Types")
    ws4.append(["Gate key", "Description"])
    style_header_row(ws4, 1, 2)
    for key, desc in RISK_MATRIX["gates"].items():
        ws4.append([key, desc])
    auto_width(ws4)

    # ── Sheet 5: Risk Levels ──
    ws5 = wb.create_sheet("Risk Levels")
    ws5.append(["Level key", "Label", "Max score (inclusive)", "BUSINESS: New max score"])
    style_header_row(ws5, 1, 4)
    for th in RISK_MATRIX["levelThresholds"]:
        max_s = th["maxScore"] if th["maxScore"] < 9999 else "∞"
        ws5.append([th["level"], th["label"], max_s, None])
    for row in ws5.iter_rows(min_row=2, max_row=ws5.max_row, min_col=4, max_col=4):
        for cell in row:
            cell.fill = EDIT_FILL
    auto_width(ws5)

    # ── Sheet 6: Status Multipliers ──
    ws6 = wb.create_sheet("Status Multipliers")
    ws6.append(["Status", "Multiplier", "BUSINESS: New multiplier"])
    style_header_row(ws6, 1, 3)
    for status, mult in RISK_MATRIX["statusMultipliers"].items():
        ws6.append([status, mult, None])
    for row in ws6.iter_rows(min_row=2, max_row=ws6.max_row, min_col=3, max_col=3):
        for cell in row:
            cell.fill = EDIT_FILL
    auto_width(ws6)

    # ── Sheet 7: Task Matrix (main) ──
    ws7 = wb.create_sheet("Task Matrix")
    headers = [
        "Order", "Task ID", "Task", "Category", "Time slot", "Owner", "Condition",
        "Risk tier", "Tier weight", "Gate", "Gate description", "Rationale (tech)",
        "BUSINESS: Suggested tier", "BUSINESS: Suggested gate", "BUSINESS: Comments",
    ]
    ws7.append(headers)
    style_header_row(ws7, 1, len(headers))
    for col in range(13, 16):
        ws7.cell(row=1, column=col).fill = PatternFill("solid", fgColor="C99700")
        ws7.cell(row=1, column=col).font = Font(bold=True, color="FFFFFF")

    for t in MASTER_TASKS:
        meta = RISK_MATRIX["tasks"].get(t["id"], {"tier": "medium", "gate": "support", "note": ""})
        tier = meta["tier"]
        weight = RISK_MATRIX["tiers"][tier]["weight"]
        gate = meta["gate"]
        gate_desc = RISK_MATRIX["gates"].get(gate, "")
        ws7.append([
            t["order"],
            t["id"],
            t["task"],
            t["cat"],
            t["slot"],
            t["owner"],
            t["condition"] or "",
            tier,
            weight,
            gate,
            gate_desc,
            meta.get("note", ""),
            None,
            None,
            None,
        ])

    for row in ws7.iter_rows(min_row=2, max_row=ws7.max_row, min_col=13, max_col=15):
        for cell in row:
            cell.fill = EDIT_FILL

    ws7.freeze_panes = "A2"
    auto_width(ws7)

    # ── Sheet 8: Scoring Formula ──
    ws8 = wb.create_sheet("Scoring Formula")
    ws8["A1"] = "Risk score calculation"
    ws8["A1"].font = TITLE_FONT
    formula_lines = [
        "Per incomplete task:  risk_points = tier_weight × status_multiplier",
        "Status multipliers:  overdue = 2.0 | due within 14 days = 1.35 | pending = 1.0",
        "Overall score = sum of risk_points for all incomplete tasks (done = 0)",
        "Overall level from score thresholds (Risk Levels tab), unless escalation rules apply.",
        "",
        "Example (single overdue Blocker task): 5 × 2.0 = 10 points",
        "Example (pending Critical task): 4 × 1.0 = 4 points",
    ]
    for i, line in enumerate(formula_lines, start=3):
        ws8.cell(row=i, column=1, value=line)
    ws8.column_dimensions["A"].width = 85

    return wb


def main():
    wb = build_workbook()
    paths = []
    if ONEDRIVE_OUT.parent.exists():
        ONEDRIVE_OUT.parent.mkdir(parents=True, exist_ok=True)
        wb.save(ONEDRIVE_OUT)
        paths.append(ONEDRIVE_OUT)
    LOCAL_OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(LOCAL_OUT)
    paths.append(LOCAL_OUT)
    for p in paths:
        print(f"Saved: {p}")


if __name__ == "__main__":
    main()
