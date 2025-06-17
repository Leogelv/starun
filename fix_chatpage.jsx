// Временный файл для правильной структуры JSX
try {
  return (
    <div className="fixed inset-0 bg-dark-bg overflow-hidden">
      {/* Full screen cosmic sphere background */}
      <div 
        ref={mountRef}
        className="absolute inset-0 w-full h-full"
        id="canvas_container"
      />

      {/* UI overlay */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top section with title */}
        <div className="flex-shrink-0 pb-4 text-center bg-gradient-to-b from-dark-bg/90 via-dark-bg/50 to-transparent" style={{ paddingTop: 'max(95px, env(safe-area-inset-top))' }}>
          <h2 className="text-2xl font-bold text-white mb-2 text-glow" style={{ fontFamily: 'Inter Tight, sans-serif' }}>STARUNITY AI HELPER</h2>
        </div>
        
        {/* Messages and other content here */}
        
      </div>
    </div>
  );
} catch (error) {
  console.error('ChatPage render error:', error);
  return <div className="text-white p-4">Error rendering chat page: {String(error)}</div>;
}