export async function getData() {
  const url = "http://localhost:3000/api/weather/logs";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result; // ✅ Adicione o return
  } catch (error) {
    console.error(error);
    return null; // ✅ Retorne null em caso de erro
  }
}