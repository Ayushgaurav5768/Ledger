local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local cost = tonumber(ARGV[4]) or 1

local bucket = redis.call("HMGET", key, "tokens", "lastRefill")
local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

if tokens == nil then
  tokens = capacity
  lastRefill = now
end

local elapsed = now - lastRefill
local tokensToAdd = elapsed * refillRate

if tokensToAdd > 0 then
  tokens = math.min(capacity, tokens + tokensToAdd)
end

if tokens >= cost then
  tokens = tokens - cost
  redis.call("HMSET", key, "tokens", tokens, "lastRefill", now)
  redis.call("EXPIRE", key, 3600)
  return { 1, tokens }
else
  redis.call("HMSET", key, "tokens", tokens, "lastRefill", now)
  redis.call("EXPIRE", key, 3600)
  return { 0, tokens }
end
