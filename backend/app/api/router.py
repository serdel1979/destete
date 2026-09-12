from fastapi import APIRouter

from app.api.routes import alimentacion, alimentos, animales, auth, lotes, pesajes, ventas

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(lotes.router)
api_router.include_router(animales.router)
api_router.include_router(pesajes.router)
api_router.include_router(alimentos.router)
api_router.include_router(alimentacion.router)
api_router.include_router(ventas.router)
