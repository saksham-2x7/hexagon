from typing import Optional, Dict
from app.schemas.material import MaterialMetadata, ProcessingStatus
from datetime import datetime, timezone
from app.core.database import DocumentStore

class MaterialRepository:
    async def save_material(self, metadata: MaterialMetadata) -> MaterialMetadata:
        await DocumentStore.put("materials", metadata.file_id, metadata.model_dump(mode="json"))
        return metadata

    async def get_material(self, file_id: str) -> Optional[MaterialMetadata]:
        data = await DocumentStore.get("materials", file_id)
        if data:
            return MaterialMetadata(**data)
        return None

    async def update_status(self, file_id: str, status: ProcessingStatus, error: Optional[str] = None) -> Optional[MaterialMetadata]:
        material = await self.get_material(file_id)
        if material:
            material.status = status
            if error is not None:
                material.error_message = error
            await DocumentStore.put("materials", file_id, material.model_dump(mode="json"))
        return material

material_repo = MaterialRepository()
