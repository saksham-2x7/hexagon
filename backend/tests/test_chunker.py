"""
Unit and integration tests for the SemanticChunker module (Milestone 2).
Verifies chunk sizes, overlap preservation, page number tracking,
educational heading detection, and integration with Milestone 1.
"""

import io
import pytest
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.rag.chunker import (
    ChunkedDocument,
    DocumentChunk,
    SemanticChunker,
)
from app.rag.document_processor import (
    DocumentPage,
    DocumentProcessor,
    ProcessedDocument,
)
from app.rag.exceptions import ChunkingError


@pytest.fixture
def multi_page_document() -> ProcessedDocument:
    """Fixture providing a 3-page educational document with chapter headings."""
    page1 = DocumentPage(
        page_number=1,
        text=(
            "# Chapter 1: Introduction to Machine Learning\n\n"
            "Machine learning is a field of artificial intelligence focused on building applications "
            "that learn from data and improve their accuracy over time without being explicitly programmed.\n\n"
            "Supervised learning algorithms build a mathematical model of a set of data that contains "
            "both the inputs and the desired outputs."
        ),
        metadata={"word_count": 52},
    )
    page2 = DocumentPage(
        page_number=2,
        text=(
            "## Section 1.1: Neural Networks and Deep Learning\n\n"
            "Deep learning is a subset of machine learning based on artificial neural networks with representation learning.\n\n"
            "A multilayer perceptron (MLP) consists of at least three layers of nodes: an input layer, "
            "a hidden layer, and an output layer. Except for the input nodes, each node is a neuron that uses "
            "a nonlinear activation function."
        ),
        metadata={"word_count": 58},
    )
    page3 = DocumentPage(
        page_number=3,
        text=(
            "### Section 1.2: Model Evaluation\n\n"
            "Evaluation metrics assess how well a model generalizes to unseen test data.\n\n"
            "Common classification metrics include Accuracy, Precision, Recall, F1-Score, and ROC-AUC."
        ),
        metadata={"word_count": 28},
    )

    return ProcessedDocument(
        file_name="ml_textbook.pdf",
        file_type="pdf",
        total_pages=3,
        pages=[page1, page2, page3],
        raw_text="\n\n".join([page1.text, page2.text, page3.text]),
        metadata={"author": "AI Teacher Team"},
    )


# ----------------------------------------------------------------------
# Core Chunking & Size Tests
# ----------------------------------------------------------------------

def test_chunk_document_basic(multi_page_document):
    """Test basic chunking of a multi-page document."""
    chunker = SemanticChunker(chunk_size_chars=400, chunk_overlap_chars=50)
    result = chunker.chunk_document(multi_page_document)

    assert isinstance(result, ChunkedDocument)
    assert result.file_name == "ml_textbook.pdf"
    assert result.file_type == "pdf"
    assert result.total_chunks > 0
    assert len(result.chunks) == result.total_chunks

    for chunk in result.chunks:
        assert isinstance(chunk, DocumentChunk)
        assert len(chunk.text) > 0
        assert chunk.token_count > 0
        assert chunk.char_count == len(chunk.text)
        assert chunk.chunk_id.startswith("ml_textbook_")


def test_chunk_size_and_overlap_behavior():
    """Test that chunks stay within size bounds and maintain overlap."""
    text = (
        "Paragraph One introduces fundamental concepts of distributed computing.\n\n"
        "Paragraph Two discusses Byzantine fault tolerance and consensus mechanisms.\n\n"
        "Paragraph Three covers Raft and Paxos state machine replication protocols.\n\n"
        "Paragraph Four explains distributed hash tables and consistent hashing.\n\n"
        "Paragraph Five summarizes fault detection and leader election algorithms."
    )

    chunker = SemanticChunker(chunk_size_chars=250, chunk_overlap_chars=80, min_chunk_size_chars=30)
    result = chunker.chunk_document(text, file_name="distributed_systems.txt")

    assert result.total_chunks >= 2
    for i in range(len(result.chunks) - 1):
        c1 = result.chunks[i]
        c2 = result.chunks[i + 1]
        assert c1.char_count <= 400


# ----------------------------------------------------------------------
# Page Tracking Tests
# ----------------------------------------------------------------------

def test_page_number_retention(multi_page_document):
    """Verify that chunks accurately retain their source page numbers."""
    chunker = SemanticChunker(chunk_size_chars=300, chunk_overlap_chars=50)
    result = chunker.chunk_document(multi_page_document)

    first_chunk = result.chunks[0]
    assert 1 in first_chunk.page_numbers
    assert first_chunk.primary_page == 1

    last_chunk = result.chunks[-1]
    assert 3 in last_chunk.page_numbers
    assert last_chunk.primary_page in [2, 3]


def test_cross_page_chunk_tracking():
    """Verify that chunks containing blocks from multiple pages list all spanned pages."""
    pages = [
        DocumentPage(page_number=1, text="Page 1 trailing thought that leads directly into..."),
        DocumentPage(page_number=2, text="...Page 2 continuation of the foundational theorem."),
    ]
    doc = ProcessedDocument(
        file_name="spanning_pages.pdf",
        file_type="pdf",
        total_pages=2,
        pages=pages,
        raw_text="",
        metadata={},
    )

    # Large enough chunk size to hold both pages in a single chunk
    chunker = SemanticChunker(chunk_size_chars=500, chunk_overlap_chars=50)
    result = chunker.chunk_document(doc)

    assert result.total_chunks == 1
    chunk = result.chunks[0]
    assert chunk.page_numbers == [1, 2]
    assert chunk.primary_page == 1


# ----------------------------------------------------------------------
# Section & Heading Detection Tests
# ----------------------------------------------------------------------

def test_heading_detection_patterns():
    """Test heading detection across Markdown, Chapter, and Numbered patterns."""
    chunker = SemanticChunker()

    assert chunker.detect_heading("# Introduction") == "Introduction"
    assert chunker.detect_heading("## 2.3 Convolutional Networks") == "2.3 Convolutional Networks"
    assert chunker.detect_heading("Chapter 4: Reinforcement Learning") == "Chapter 4: Reinforcement Learning"
    assert chunker.detect_heading("Module 1 - Python Fundamentals") == "Module 1 - Python Fundamentals"
    assert chunker.detect_heading("Lesson 5: Gradient Descent") == "Lesson 5: Gradient Descent"
    assert chunker.detect_heading("1.2.3 Optimization Basics") == "1.2.3 Optimization Basics"
    assert chunker.detect_heading("KEY TAKEAWAYS:") == "KEY TAKEAWAYS"

    # Regular sentences should NOT be detected as headings
    assert chunker.detect_heading("This is a normal paragraph discussing algorithms.") is None
    assert chunker.detect_heading("For chapter 1, please read pages 20-40.") is None


def test_section_title_attached_to_chunks(multi_page_document):
    """Verify section titles are properly attached to chunks."""
    chunker = SemanticChunker(chunk_size_chars=350, chunk_overlap_chars=40)
    result = chunker.chunk_document(multi_page_document)

    # First chunk should have Chapter 1 heading
    assert "Chapter 1" in result.chunks[0].section_title

    # Later chunks should carry subheadings
    section_titles = [c.section_title for c in result.chunks if c.section_title is not None]
    assert len(section_titles) > 0
    assert any("Neural Networks" in title or "Chapter 1" in title for title in section_titles)


# ----------------------------------------------------------------------
# Edge Cases & Boundary Handling
# ----------------------------------------------------------------------

def test_empty_document_handling():
    """Test handling of empty documents or 0-page inputs."""
    chunker = SemanticChunker()
    empty_doc = ProcessedDocument(
        file_name="empty.txt",
        file_type="txt",
        total_pages=0,
        pages=[],
        raw_text="",
        metadata={},
    )
    result = chunker.chunk_document(empty_doc)
    assert result.total_chunks == 0
    assert result.chunks == []
    assert result.total_characters == 0
    assert result.total_estimated_tokens == 0


def test_short_text_handling():
    """Test handling of short text below min_chunk_size_chars."""
    chunker = SemanticChunker(chunk_size_chars=1000, min_chunk_size_chars=50)
    short_text = "Brief definition: Entropy is the measure of disorder."
    result = chunker.chunk_document(short_text, file_name="short.txt")

    assert result.total_chunks == 1
    assert result.chunks[0].text == short_text
    assert result.chunks[0].primary_page == 1


def test_oversized_single_paragraph():
    """Test splitting an oversized paragraph with no double newlines."""
    long_sentence_1 = "First comprehensive principle of quantum computing involves superposition and quantum bits. " * 8
    long_sentence_2 = "Second principle involves quantum entanglement and Bell inequalities across qubits. " * 8
    full_text = f"{long_sentence_1}\n{long_sentence_2}"

    chunker = SemanticChunker(chunk_size_chars=300, chunk_overlap_chars=50)
    result = chunker.chunk_document(full_text, file_name="quantum.txt")

    assert result.total_chunks >= 2
    for chunk in result.chunks:
        assert chunk.char_count > 0


def test_invalid_parameters():
    """Test validation of invalid constructor parameters."""
    with pytest.raises(ValueError, match="chunk_size_chars must be greater than 0"):
        SemanticChunker(chunk_size_chars=0)

    with pytest.raises(ValueError, match="chunk_overlap_chars cannot be negative"):
        SemanticChunker(chunk_size_chars=500, chunk_overlap_chars=-10)

    with pytest.raises(ValueError, match="strictly less than chunk_size_chars"):
        SemanticChunker(chunk_size_chars=500, chunk_overlap_chars=500)


# ----------------------------------------------------------------------
# Serialization & Milestone 1 Integration Tests
# ----------------------------------------------------------------------

def test_chunk_serialization():
    """Test to_dict() serialization for DocumentChunk and ChunkedDocument."""
    chunker = SemanticChunker()
    doc = ProcessedDocument(
        file_name="stats.txt",
        file_type="txt",
        total_pages=1,
        pages=[DocumentPage(page_number=1, text="Mean, Median, and Mode are measures of central tendency.")],
        raw_text="Mean, Median, and Mode are measures of central tendency.",
        metadata={"subject": "Statistics"},
    )
    result = chunker.chunk_document(doc)
    doc_dict = result.to_dict()

    assert isinstance(doc_dict, dict)
    assert doc_dict["file_name"] == "stats.txt"
    assert doc_dict["total_chunks"] == 1
    assert isinstance(doc_dict["chunks"], list)
    
    first_chunk = doc_dict["chunks"][0]
    assert "chunk_id" in first_chunk
    assert first_chunk["primary_page"] == 1
    assert first_chunk["page_numbers"] == [1]
    assert first_chunk["token_count"] > 0
    assert first_chunk["metadata"]["subject"] == "Statistics"


def test_end_to_end_milestone1_to_milestone2_pipeline():
    """Test full integration from PDF bytes -> DocumentProcessor -> SemanticChunker."""
    # Step 1: Create sample educational PDF
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)
    c.drawString(72, 750, "Chapter 1: Foundations of Artificial Intelligence")
    c.drawString(72, 720, "AI systems emulate human cognitive functions like learning and problem solving.")
    c.drawString(72, 690, "Supervised learning relies on labeled training datasets to train predictive models.")
    c.showPage()
    c.drawString(72, 750, "Chapter 2: Search Algorithms in AI")
    c.drawString(72, 720, "Breadth-First Search (BFS) and Depth-First Search (DFS) explore tree state spaces.")
    c.drawString(72, 690, "A-star heuristic search combines path cost g(n) with estimated future cost h(n).")
    c.showPage()
    c.save()
    pdf_bytes = buf.getvalue()

    # Step 2: Milestone 1 text extraction
    extracted_doc = DocumentProcessor.extract_text(pdf_bytes, file_name="ai_course.pdf", file_type="pdf")
    assert extracted_doc.total_pages == 2

    # Step 3: Milestone 2 chunking with appropriate chunk size
    chunker = SemanticChunker(chunk_size_chars=180, chunk_overlap_chars=40)
    chunked_doc = chunker.chunk_document(extracted_doc)

    assert chunked_doc.file_name == "ai_course.pdf"
    assert chunked_doc.file_type == "pdf"
    assert chunked_doc.total_chunks >= 2

    # Verify that Chapter 1 and Chapter 2 are captured as section titles
    section_titles = [c.section_title for c in chunked_doc.chunks if c.section_title]
    assert any("Chapter 1" in title for title in section_titles)
    assert any("Chapter 2" in title for title in section_titles)