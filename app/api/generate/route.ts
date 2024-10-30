import { ShortLinkGenerateRequest } from '@/utils/service';
import { NextRequest } from 'next/server';
import { kv } from '@vercel/kv';
import murmurhash from 'murmurhash';
import { getEnv, ENV_KEY } from '@/utils/env';


const base62Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// 抽成公共方法
function toBase62(num: number): string {
  let encoded = '';
  while (num > 0) {
    encoded = base62Chars[num % 62] + encoded;
    num = Math.floor(num / 62);
  }
  return encoded || '0'; // 如果结果为空，返回 '0'
}

/**
 * Validates a request object.
 *
 * @param {QrGenerateRequest} request - The request object to be validated.
 * @throws {Error} Error message if URL or prompt is missing.
 */

const validateRequest = (request: ShortLinkGenerateRequest) => {
  if (!request.url) {
    throw new Error('URL is required');
  }

};

// const ratelimit = new Ratelimit({
//   redis: kv,
//   // Allow 20 requests from the same IP in 1 day.
//   limiter: Ratelimit.slidingWindow(20, '1 d'),
// });

export async function POST(request: NextRequest) {

  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';

  const currentDomain = `${protocol}://${host}`;

  const reqBody = (await request.json()) as ShortLinkGenerateRequest;

  console.log("请求参数:", reqBody)

  try {
    // 校验请求参数
    validateRequest(reqBody);
  } catch (e) {
    if (e instanceof Error) {
      return new Response(e.message, { status: 400 });
    }
  }

  let code = murmurhash.v3(reqBody.url).toString();
  console.log("code:", toBase62(Number(code)))

  code = toBase62(Number(code))

  const preCode = await kv.get(code);
  if (preCode === code) {
    // TODO 重新生成code

  }
  // 短链
  const shortLink = currentDomain + "/s/" + code;

  // TODO 超时时间
  let expireTime = Number(getEnv(ENV_KEY.LINK_EXPIRE_TIME));
  console.log("expireTime:", expireTime)
  if (expireTime) {
    await kv.set(
      code, 
      {
        code: code,
        url: reqBody.url,
        short_link: shortLink,
      }, 
      { ex: expireTime }
    );
  }else {
    await kv.set(
      code, 
      {
        code: code,
        url: reqBody.url,
        short_link: shortLink,
      });
  }

  const value = await kv.get(code)
  console.log("value:", value)

  return new Response(JSON.stringify(value), {
    status: 200,
  });
}
