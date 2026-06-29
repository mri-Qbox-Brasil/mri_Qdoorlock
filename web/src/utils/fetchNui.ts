/**
 * Simple wrapper around fetch API tailored for CEF/NUI use. This abstraction
 * can be extended to include AbortController if needed or if the response isn't
 * JSON. Tailor it to your needs.
 *
 * @param eventName - The endpoint eventname to target
 * @param data - Data you wish to send in the NUI Callback
 *
 * @return returnData - A promise for the data sent back by the NuiCallbacks CB argument
 */

export async function fetchNui<T = any>(eventName: string, data?: any): Promise<T> {
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(data),
  };

  let resourceName = 'nui-frame-app';
  if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    resourceName = window.location.hostname.replace('cfx-nui-', '');
  } else if ((window as any).GetParentResourceName) {
    resourceName = (window as any).GetParentResourceName();
  }
  const resp = await fetch(`https://${resourceName}/${eventName}`, options);

  try {
    const respFormatted = await resp.json();
    return respFormatted;
  } catch (error) {
    return null as any;
  }
}
