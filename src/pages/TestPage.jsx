// Test page to verify routing
function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🧪 Test Page</h1>
      <p>If you can see this, routing is working!</p>
      <div style={{ marginTop: '20px' }}>
        <h3>Navigation Test:</h3>
        <ul>
          <li><a href="/photos">Photos Page</a></li>
          <li><a href="/csv-import">CSV Import Page</a></li>
          <li><a href="/sops">SOPs Page</a></li>
        </ul>
      </div>
    </div>
  );
}

export default TestPage;