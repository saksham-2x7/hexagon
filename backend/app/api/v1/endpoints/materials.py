import asyncio
from fastapi import APIRouter, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from app.schemas.material import MaterialMetadata, ProcessingStatus
from app.repositories.material_repo import material_repo

router = APIRouter()

async def mock_document_processing(file_id: str):
    """
    Mock background task that simulates handing off the file
    to Janani's RAG extraction pipeline.
    """
    # Simulate processing time
    await asyncio.sleep(1)
    
    # Mark as READY
    await material_repo.update_status(file_id, ProcessingStatus.READY)


@router.post("/upload", response_model=MaterialMetadata, status_code=status.HTTP_202_ACCEPTED)
async def upload_material(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    student_id: str = Form(...)
):
    # In a real system, we'd save the file.file stream to cloud storage here.
    
    metadata = MaterialMetadata(
        student_id=student_id,
        filename=file.filename or "unknown",
        file_type=file.content_type or "application/octet-stream",
        status=ProcessingStatus.PENDING
    )
    
    await material_repo.save_material(metadata)
    
    # Spawn background task to process the document
    background_tasks.add_task(mock_document_processing, metadata.file_id)
    
    return metadata

@router.get("/{file_id}", response_model=MaterialMetadata)
async def get_material_status(file_id: str):
    metadata = await material_repo.get_material(file_id)
    if not metadata:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return metadata
