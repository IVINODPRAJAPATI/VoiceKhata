from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/pdf")
def generate_pdf_report(db: Session = Depends(get_db)):
    # Fetch latest data from database
    expenses = db.query(models.Expense).order_by(models.Expense.date.desc()).all()
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Custom Title Style
    title_style = ParagraphStyle(
        'VoiceKhataTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.HexColor("#6366f1"), # Indigo
        spaceAfter=20,
        alignment=1 # Center
    )
    
    # Add Title
    elements.append(Paragraph("VoiceKhata Monthly Expense Report", title_style))
    elements.append(Spacer(1, 0.2 * inch))
    
    # Summary calculation
    total_amount = sum(e.amount for e in expenses)
    summary_text = f"<b>Total Expenses Recorded:</b> ₹{total_amount:,.2f}<br/>"
    summary_text += f"<b>Total Records:</b> {len(expenses)}"
    
    summary_style = styles["Normal"]
    summary_style.fontSize = 12
    elements.append(Paragraph(summary_text, summary_style))
    elements.append(Spacer(1, 0.3 * inch))
    
    # Table Data Preparation
    data = [["Date", "Amount (₹)", "Category", "Department", "Description"]]
    
    for exp in expenses:
        date_str = exp.date.strftime("%d %b %Y") if exp.date else "N/A"
        amount_str = f"{exp.amount:,.2f}"
        category = exp.category if exp.category else "Miscellaneous"
        department = exp.department if exp.department else "N/A"
        description = exp.description if exp.description else ""
        
        # Truncate long descriptions
        if len(description) > 30:
            description = description[:27] + "..."
            
        data.append([date_str, amount_str, category, department, description])
    
    # Create Table
    # Column widths (7.5 inches total width for letter)
    col_widths = [1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 2.7*inch]
    t = Table(data, colWidths=col_widths, repeatRows=1)
    
    # Table Styling
    style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#6366f1")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'), # Align amount column to right
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f8fafc")), # Slate 50 equivalent
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")), # Slate 200 equivalent
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]) # Zebra striping
    ])
    t.setStyle(style)
    
    elements.append(t)
    
    # Build PDF
    doc.build(elements)
    
    buffer.seek(0)
    
    headers = {
        "Content-Disposition": 'attachment; filename="VoiceKhata_Report.pdf"'
    }
    
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers=headers)
