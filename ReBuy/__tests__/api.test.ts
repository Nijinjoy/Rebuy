import { ApiError, request, setAuthToken } from '../src/api/client';
import { fetchListing, fetchListings } from '../src/api/listings';
import { SAMPLE_PRODUCTS } from '../src/data/sampleProducts';

const fetchMock = jest.fn();
globalThis.fetch = fetchMock;

afterEach(() => {
  fetchMock.mockReset();
  setAuthToken(null);
});

test('request sends JSON with the auth token and returns the body', async () => {
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ id: 1 }) });
  setAuthToken('abc');

  await expect(
    request('/things', { method: 'POST', body: { a: 1 } }),
  ).resolves.toEqual({ id: 1 });

  const [, init] = fetchMock.mock.calls[0];
  expect(init.method).toBe('POST');
  expect(init.body).toBe('{"a":1}');
  expect(init.headers.Authorization).toBe('Bearer abc');
});

test('request turns error responses into ApiError', async () => {
  fetchMock.mockResolvedValue({
    ok: false,
    status: 404,
    json: async () => ({ message: 'Listing not found' }),
  });

  const error = (await request('/listings/x').catch(e => e)) as ApiError;
  expect(error).toBeInstanceOf(ApiError);
  expect(error.status).toBe(404);
  expect(error.message).toBe('Listing not found');
});

test('request reports network failures with status 0', async () => {
  fetchMock.mockRejectedValue(new TypeError('Network request failed'));

  const error = (await request('/listings').catch(e => e)) as ApiError;
  expect(error).toBeInstanceOf(ApiError);
  expect(error.status).toBe(0);
});

test('mock listings API serves sample data', async () => {
  await expect(fetchListings()).resolves.toEqual(SAMPLE_PRODUCTS);
  await expect(fetchListing('p1')).resolves.toBe(SAMPLE_PRODUCTS[0]);
  await expect(fetchListing('missing')).rejects.toMatchObject({ status: 404 });
  expect(fetchMock).not.toHaveBeenCalled();
});
