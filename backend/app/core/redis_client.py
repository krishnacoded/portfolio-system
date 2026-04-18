import json
import redis.asyncio as aioredis
from typing import Any
from app.core.config import settings

CACHE_PREFIX = "portfolio"

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    global _redis_client
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
    return _redis_client


async def close_redis() -> None:
    global _redis_client
    if _redis_client:
        await _redis_client.aclose()
        _redis_client = None


# ── Cache helpers ─────────────────────────────────────────────────────────────

async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    client = await get_redis()
    key = f"{CACHE_PREFIX}:{key}"
    await client.set(key, json.dumps(value), ex=ttl)


async def cache_get(key: str) -> Any | None:
    client = await get_redis()
    key = f"{CACHE_PREFIX}:{key}"
    raw = await client.get(key)

    if raw is None:
        return None

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


async def cache_delete(key: str) -> None:
    client = await get_redis()
    key = f"{CACHE_PREFIX}:{key}"
    await client.delete(key)


# ── Rate-limit helpers ────────────────────────────────────────────────────────

async def rate_limit_check(
    key: str,
    limit: int,
    window_seconds: int,
) -> tuple[bool, int]:
    client = await get_redis()
    key = f"{CACHE_PREFIX}:rate:{key}"

    pipe = client.pipeline()
    pipe.incr(key)
    pipe.ttl(key)
    count, ttl = await pipe.execute()

    if ttl == -1:
        await client.expire(key, window_seconds)

    remaining = max(0, limit - count)
    return count <= limit, remaining


# ── Health check ─────────────────────────────────────────────────────────────

async def redis_ping() -> bool:
    try:
        client = await get_redis()
        return await client.ping()
    except Exception:
        return False