#!/usr/bin/env python3
"""Build docs/V4_Action_Log_Tasks.xlsx from embedded master list + contacts metadata."""

import json
from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent.parent
CONTACTS_JSON = ROOT / "assets/contacts-v4.json"
XLSX_OUT = ROOT / "docs/V4_Action_Log_Tasks.xlsx"

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

HEADERS = [
    "ID",
    "Order",
    "Task",
    "Final Category",
    "Sub Category",
    "Deadline slot",
    "Condition",
    "Owner",
    "Contact",
    "Suggestion",
    "Action label",
    "Action URL",
    "Notes",
    "Status",
    "Comments",
]

COL_WIDTHS = [6, 8, 62, 22, 22, 14, 22, 12, 14, 48, 24, 36, 48, 12, 48]

CONDITION_HELP = (
    "Condition flags (leave blank if always shown): "
    "hasTaxConcerns, hasImmigration, needsIntercultural, hasChildren, hasPets, "
    "needsTempHousing, hasLanguageBarrier"
)


def style_header(ws):
    fill = PatternFill("solid", fgColor="0F3D4C")
    font = Font(bold=True, color="FFFFFF", size=11)
    border = Border(
        left=Side(style="thin", color="CCCCCC"),
        right=Side(style="thin", color="CCCCCC"),
        top=Side(style="thin", color="CCCCCC"),
        bottom=Side(style="thin", color="CCCCCC"),
    )
    for col, title in enumerate(HEADERS, 1):
        cell = ws.cell(row=1, column=col, value=title)
        cell.fill = fill
        cell.font = font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border
    ws.row_dimensions[1].height = 28


def load_task_meta():
    if not CONTACTS_JSON.exists():
        return {}
    data = json.loads(CONTACTS_JSON.read_text(encoding="utf-8"))
    return data.get("tasks", {})


def main():
    meta = load_task_meta()

    wb = Workbook()
    ws = wb.active
    ws.title = "Action Log Tasks"
    style_header(ws)

    wrap = Alignment(vertical="top", wrap_text=True)
    thin = Border(
        left=Side(style="thin", color="E8EAED"),
        right=Side(style="thin", color="E8EAED"),
        top=Side(style="thin", color="E8EAED"),
        bottom=Side(style="thin", color="E8EAED"),
    )

    for r_idx, row in enumerate(MASTER_TASKS, start=2):
        task_meta = meta.get(str(row["id"]), {})
        contact = task_meta.get("contact") or row["owner"]
        values = [
            row["id"],
            row["order"],
            row["task"],
            task_meta.get("finalCategory") or row["cat"],
            row["cat"],
            row["slot"],
            row["condition"] or "",
            "Expat",
            contact,
            task_meta.get("suggestion") or "",
            task_meta.get("actionLabel") or "",
            task_meta.get("actionUrl") or "",
            task_meta.get("debbieNote") or "",
            "Active",
            task_meta.get("comments") or "",
        ]
        for c_idx, value in enumerate(values, start=1):
            cell = ws.cell(row=r_idx, column=c_idx, value=value)
            cell.alignment = wrap
            cell.border = thin

    for idx, width in enumerate(COL_WIDTHS, start=1):
        ws.column_dimensions[get_column_letter(idx)].width = width

    ws.freeze_panes = "A2"

    help_ws = wb.create_sheet("README")
    help_ws["A1"] = "V4 Action Log Tasks — source of truth"
    help_ws["A1"].font = Font(bold=True, size=12)
    help_ws["A3"] = "Edit rows on the 'Action Log Tasks' sheet. The V4 demo reloads from this file on each request."
    help_ws["A5"] = "Final Category is the value shown in the app (Offer, Immigration, Relocation preparation, arrivel, Settle-in)."
    help_ws["A6"] = "Category is the legacy/original label kept for reference."
    help_ws["A8"] = CONDITION_HELP
    help_ws["A10"] = "Set Status = Disabled to hide a task from the action log."
    help_ws["A12"] = "Deadline slot values: 90-120d, 60d, 30d, arrival"
    help_ws.column_dimensions["A"].width = 100

    XLSX_OUT.parent.mkdir(parents=True, exist_ok=True)
    wb.save(XLSX_OUT)
    print(f"Wrote {XLSX_OUT} ({len(MASTER_TASKS)} tasks)")


if __name__ == "__main__":
    main()
