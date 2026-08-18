# Risk Matrix — ingest for V4

## Source file

Business maintains the Excel matrix:

- OneDrive: `Expat/expat-concierge/data/V3_Assignment_Risk_Matrix_v*.xlsx`
- Repo copy: `docs/V*_Assignment_Risk_Matrix_*.xlsx`

Yellow **BUSINESS REVIEW** columns override tech values when filled.

## Ingest

```bash
python3 scripts/ingest_risk_matrix.py
# or
python3 scripts/ingest_risk_matrix.py --input /path/to/updated_matrix.xlsx
```

Outputs:

| File | Used by |
|------|---------|
| `data/risk-matrix.json` | Source of truth in repo |
| `assets/risk-matrix.json` | V4 UI (`/assets/risk-matrix.json`) |

## V4 UI

Open `http://localhost:3000/v4` → **Risk** tab. Version and updated date appear in the score subtitle and tier panel.

Restart is not required after ingest — refresh the browser (JSON is loaded at page load).

## Export template (for business)

```bash
python3 scripts/export_risk_matrix_xlsx.py
```

Creates a fresh Excel for review with yellow edit columns.
