from typing import Optional, Dict
from app.schemas.material import MaterialMetadata, ProcessingStatus
from datetime import datetime, timezone

class MaterialRepository:
    def __init__(self):
        self._materials: Dict[str, MaterialMetadata] = {}

    async def save_material(self, metadata: MaterialMetadata) -> MaterialMetadata:
        self._materials[metadata.file_id] = metadata
        return metadata

    async def get_material(self, file_id: str) -> Optional[MaterialMetadata]:
        return self._materials.get(file_id)

    async def update_status(self, file_id: str, status: ProcessingStatus, error: Optional[str] = None) -> Optional[MaterialMetadata]:
        material = self._materials.get(file_id)
        if material:
            material.status = status
            if error is not None:
                material.error_message = error
            self._materials[file_id] = material
        return material

material_repo = MaterialRepository()
