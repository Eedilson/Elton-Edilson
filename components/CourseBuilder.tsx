
import React, { useState } from 'react';
import { CourseModule, CourseLesson, SupportMaterial } from '../types';
import { 
  Plus, Folder, PlayCircle, FileText, Trash2, ChevronDown, ChevronRight, 
  Video, Link as LinkIcon, UploadCloud, MessageSquare, Check, GripVertical,
  Layout, X, HardDrive, Image as ImageIcon, Settings, Calendar, Lock
} from 'lucide-react';
import { SimbaCloud } from '../services/cloudService';

interface CourseBuilderProps {
  modules: CourseModule[];
  welcomeVideoUrl?: string; // Legacy/External
  welcomeVideoSource?: 'external' | 'local';
  welcomeVideoBlobUrl?: string;
  
  onUpdateModules: (modules: CourseModule[]) => void;
  onUpdateWelcomeVideo: (url: string, source: 'external' | 'local', blobUrl?: string) => void;
}

const CourseBuilder: React.FC<CourseBuilderProps> = ({ 
    modules, 
    welcomeVideoUrl, 
    welcomeVideoSource = 'external', 
    welcomeVideoBlobUrl,
    onUpdateModules, 
    onUpdateWelcomeVideo 
}) => {
  // Selection state: { moduleId, lessonId } OR { moduleId, lessonId: null } (Module Settings) OR null (Welcome Settings)
  const [selectedId, setSelectedId] = useState<{moduleId: string, lessonId: string | null} | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>(modules.map(m => m.id));
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [welcomeUploadProgress, setWelcomeUploadProgress] = useState(0);

  // --- MODULE ACTIONS ---
  const addModule = () => {
    const newModule: CourseModule = {
      id: Date.now().toString(),
      title: 'Novo Módulo',
      lessons: [],
    };
    onUpdateModules([...modules, newModule]);
    setExpandedModules([...expandedModules, newModule.id]);
    setSelectedId({ moduleId: newModule.id, lessonId: null });
  };

  const updateModule = (moduleId: string, updates: Partial<CourseModule>) => {
    onUpdateModules(modules.map(m => m.id === moduleId ? { ...m, ...updates } : m));
  };

  const deleteModule = (moduleId: string) => {
    if (confirm('Tem certeza? Todas as aulas deste módulo serão apagadas.')) {
        onUpdateModules(modules.filter(m => m.id !== moduleId));
        setSelectedId(null);
    }
  };

  const toggleModuleExpand = (moduleId: string) => {
    if (expandedModules.includes(moduleId)) {
      setExpandedModules(expandedModules.filter(id => id !== moduleId));
    } else {
      setExpandedModules([...expandedModules, moduleId]);
    }
  };

  const handleModuleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, moduleId: string) => {
      if (e.target.files && e.target.files[0]) {
          const url = await SimbaCloud.uploadImage(e.target.files[0]);
          updateModule(moduleId, { coverImage: url });
      }
  };

  // --- LESSON ACTIONS ---
  const addLesson = (moduleId: string) => {
    const newLesson: CourseLesson = {
      id: Date.now().toString(),
      title: 'Nova Aula',
      allowComments: true,
      isPublished: true,
      materials: [],
      videoSource: 'external'
    };
    
    onUpdateModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    }));
    
    // Auto select new lesson
    setSelectedId({ moduleId, lessonId: newLesson.id });
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<CourseLesson>) => {
     onUpdateModules(modules.map(m => {
       if (m.id === moduleId) {
         return {
           ...m,
           lessons: m.lessons.map(l => l.id === lessonId ? { ...l, ...updates } : l)
         };
       }
       return m;
     }));
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    onUpdateModules(modules.map(m => {
        if (m.id === moduleId) {
            return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
    }));
    if (selectedId?.lessonId === lessonId) setSelectedId(null);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, moduleId: string, lessonId: string) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setVideoUploadProgress(10);
          
          const interval = setInterval(() => {
              setVideoUploadProgress(prev => {
                  if (prev >= 90) {
                      clearInterval(interval);
                      return 90;
                  }
                  return prev + 10;
              });
          }, 200);

          try {
            const url = await SimbaCloud.uploadFile(file);
            if (url) {
                updateLesson(moduleId, lessonId, { 
                    videoSource: 'local',
                    videoBlobUrl: url 
                });
                setVideoUploadProgress(100);
            }
          } catch(e) {
              alert("Erro ao carregar vídeo");
          } finally {
              setTimeout(() => setVideoUploadProgress(0), 1000);
              clearInterval(interval);
          }
      }
  };

  const handleWelcomeVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setWelcomeUploadProgress(10);
          
          const interval = setInterval(() => {
              setWelcomeUploadProgress(prev => {
                  if (prev >= 90) {
                      clearInterval(interval);
                      return 90;
                  }
                  return prev + 10;
              });
          }, 200);

          try {
            const url = await SimbaCloud.uploadFile(file);
            if (url) {
                onUpdateWelcomeVideo(welcomeVideoUrl || '', 'local', url);
                setWelcomeUploadProgress(100);
            }
          } catch(e) {
              alert("Erro ao carregar vídeo");
          } finally {
              setTimeout(() => setWelcomeUploadProgress(0), 1000);
              clearInterval(interval);
          }
      }
  };

  const handleLessonImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, moduleId: string, lessonId: string) => {
      if (e.target.files && e.target.files[0]) {
          const url = await SimbaCloud.uploadImage(e.target.files[0]);
          updateLesson(moduleId, lessonId, { coverImage: url });
      }
  };

  // --- MATERIAL ACTIONS ---
  const addMaterial = async (moduleId: string, lessonId: string, type: 'link' | 'file') => {
      let url = '';
      let title = 'Novo Material';

      if (type === 'file') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.zip,.png,.jpg';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (file) {
                url = await SimbaCloud.uploadFile(file);
                title = file.name;
                
                const newMaterial: SupportMaterial = {
                    id: Date.now().toString(),
                    title,
                    type: file.type.includes('pdf') ? 'pdf' : 'archive',
                    url
                };
                
                const module = modules.find(m => m.id === moduleId);
                const lesson = module?.lessons.find(l => l.id === lessonId);
                if (lesson) {
                    updateLesson(moduleId, lessonId, { materials: [...(lesson.materials || []), newMaterial] });
                }
            }
        };
        input.click();
      } else {
        const newMaterial: SupportMaterial = {
            id: Date.now().toString(),
            title: 'Link Externo',
            type: 'link',
            url: ''
        };
        const module = modules.find(m => m.id === moduleId);
        const lesson = module?.lessons.find(l => l.id === lessonId);
        if (lesson) {
            updateLesson(moduleId, lessonId, { materials: [...(lesson.materials || []), newMaterial] });
        }
      }
  };

  const removeMaterial = (moduleId: string, lessonId: string, materialId: string) => {
      const module = modules.find(m => m.id === moduleId);
      const lesson = module?.lessons.find(l => l.id === lessonId);
      if (lesson) {
          updateLesson(moduleId, lessonId, { materials: lesson.materials?.filter(m => m.id !== materialId) });
      }
  };

  // --- RENDER HELPERS ---
  const activeModule = selectedId ? modules.find(m => m.id === selectedId.moduleId) : null;
  const activeLessonData = (selectedId && selectedId.lessonId && activeModule) 
    ? activeModule.lessons.find(l => l.id === selectedId.lessonId)
    : null;

  const isModuleSettings = selectedId && activeModule && !selectedId.lessonId;

  return (
    <div className="flex h-[600px] border border-gray-800 rounded-xl overflow-hidden bg-[#161b22]">
      
      {/* SIDEBAR: MODULES LIST */}
      <div className="w-80 border-r border-gray-800 flex flex-col bg-[#0f1419]">
        <div className="p-4 border-b border-gray-800 bg-[#1e2329]">
             <h3 className="font-bold text-white flex items-center gap-2">
                <Layout className="w-4 h-4" /> Estrutura do Curso
             </h3>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            
            {/* WELCOME CONFIG */}
            <div 
                onClick={() => setSelectedId(null)}
                className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${selectedId === null ? 'bg-emerald-500/10 border border-emerald-500/30' : 'hover:bg-gray-800 border border-transparent'}`}
            >
                <PlayCircle className="w-5 h-5 text-emerald-500" />
                <span className={`text-sm font-medium ${selectedId === null ? 'text-emerald-500' : 'text-gray-400'}`}>Boas-vindas</span>
            </div>

            <hr className="border-gray-800 my-2" />

            {modules.map((module, mIndex) => (
                <div key={module.id} className="border border-gray-800 rounded-lg bg-[#161b22] overflow-hidden">
                    {/* Module Header */}
                    <div className="flex items-center p-3 bg-gray-900/50 group">
                        <button onClick={() => toggleModuleExpand(module.id)} className="mr-2 text-gray-500 hover:text-white">
                            {expandedModules.includes(module.id) ? <ChevronDown className="w-4 h-4"/> : <ChevronRight className="w-4 h-4"/>}
                        </button>
                        <Folder className="w-4 h-4 text-blue-500 mr-2" />
                        <span 
                            onClick={() => setSelectedId({ moduleId: module.id, lessonId: null })}
                            className="bg-transparent text-sm font-bold text-gray-300 hover:text-white cursor-pointer flex-1 truncate flex items-center gap-2"
                        >
                            {module.title}
                            {module.releaseDate && <Lock className="w-3 h-3 text-red-500" />}
                        </span>
                        
                        <button 
                            onClick={() => setSelectedId({ moduleId: module.id, lessonId: null })}
                            className="ml-2 text-gray-600 hover:text-white"
                            title="Configurações do Módulo"
                        >
                            <Settings className="w-3 h-3" />
                        </button>
                        
                        <button onClick={() => deleteModule(module.id)} className="ml-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>

                    {/* Lessons List */}
                    {expandedModules.includes(module.id) && (
                        <div className="bg-[#0f1419]">
                            {module.lessons.map((lesson, lIndex) => (
                                <div 
                                    key={lesson.id}
                                    onClick={() => setSelectedId({ moduleId: module.id, lessonId: lesson.id })}
                                    className={`pl-10 pr-3 py-2 text-sm flex items-center gap-2 cursor-pointer border-l-2 ${
                                        selectedId?.lessonId === lesson.id 
                                        ? 'border-l-emerald-500 bg-gray-800 text-white' 
                                        : 'border-l-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                                    }`}
                                >
                                    <div className="w-5 h-5 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-[10px] font-mono text-gray-500">
                                        {lIndex + 1}
                                    </div>
                                    <span className="truncate flex-1">{lesson.title}</span>
                                </div>
                            ))}
                            <button 
                                onClick={() => addLesson(module.id)}
                                className="w-full text-left pl-10 py-2 text-xs text-blue-400 hover:bg-gray-800 flex items-center gap-2"
                            >
                                <Plus className="w-3 h-3" /> Adicionar Aula
                            </button>
                        </div>
                    )}
                </div>
            ))}

            <button 
                onClick={addModule}
                className="w-full py-3 border border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-white hover:border-emerald-500 transition-colors flex items-center justify-center gap-2 text-sm"
            >
                <Plus className="w-4 h-4" /> Novo Módulo
            </button>
        </div>
      </div>

      {/* MAIN: EDITOR AREA */}
      <div className="flex-1 bg-[#161b22] flex flex-col overflow-y-auto">
        
        {/* 1. WELCOME SETTINGS */}
        {selectedId === null && (
             <div className="p-8 max-w-2xl mx-auto w-full animate-in fade-in">
                 <div className="bg-[#1e2329] p-6 rounded-xl border border-gray-800 text-center">
                     <PlayCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-white mb-2">Vídeo de Boas-vindas</h3>
                     <p className="text-gray-400 text-sm mb-6">Este vídeo aparecerá em destaque no topo da área de alunos.</p>
                     
                     {/* Video Source Toggle */}
                     <div className="flex justify-center mb-6">
                        <div className="bg-gray-800 rounded-lg p-1 flex">
                            <button 
                                onClick={() => onUpdateWelcomeVideo(welcomeVideoUrl || '', 'external', welcomeVideoBlobUrl)}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${welcomeVideoSource === 'external' ? 'bg-[#1e2329] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                Link Externo
                            </button>
                            <button 
                                onClick={() => onUpdateWelcomeVideo(welcomeVideoUrl || '', 'local', welcomeVideoBlobUrl)}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-colors ${welcomeVideoSource === 'local' ? 'bg-[#1e2329] text-white shadow' : 'text-gray-400 hover:text-white'}`}
                            >
                                Upload Arquivo
                            </button>
                        </div>
                     </div>

                     <div className="text-left">
                        {welcomeVideoSource === 'local' ? (
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors relative bg-[#0f1419]">
                                <HardDrive className="w-8 h-8 text-gray-500 mb-2" />
                                <span className="text-sm text-gray-400 mb-1">Carregar vídeo do computador (Máx 600MB)</span>
                                <span className="text-xs text-gray-600">MP4, MOV, WEBM</span>
                                <input 
                                    type="file" 
                                    onChange={handleWelcomeVideoUpload} 
                                    accept="video/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {welcomeUploadProgress > 0 && (
                                    <div className="w-full mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-200" style={{ width: `${welcomeUploadProgress}%` }}></div>
                                    </div>
                                )}
                                {welcomeVideoBlobUrl && welcomeUploadProgress === 0 && (
                                    <div className="mt-4 flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded text-xs">
                                        <Check className="w-3 h-3" /> Vídeo carregado com sucesso
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <label className="block text-xs font-bold text-gray-500 mb-2">URL do Vídeo (YouTube, Vimeo, Panda)</label>
                                <input 
                                    value={welcomeVideoUrl || ''}
                                    onChange={(e) => onUpdateWelcomeVideo(e.target.value, 'external', welcomeVideoBlobUrl)}
                                    placeholder="https://..."
                                    className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500"
                                />
                            </>
                        )}
                     </div>
                 </div>
             </div>
        )}

        {/* 2. MODULE SETTINGS */}
        {isModuleSettings && activeModule && (
            <div className="p-8 max-w-2xl mx-auto w-full animate-in fade-in">
                <h2 className="text-2xl font-bold text-white mb-6">Configurações do Módulo</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Título do Módulo</label>
                        <input 
                            value={activeModule.title}
                            onChange={(e) => updateModule(activeModule.id, { title: e.target.value })}
                            className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white text-lg font-bold outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Module Release Date (LOCKING) */}
                    <div className="bg-[#1e2329] p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 mb-3 text-yellow-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-bold">Agendamento / Bloqueio</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">Defina uma data para liberar este módulo. Antes dessa data, ele aparecerá com um cadeado.</p>
                        <input 
                            type="date"
                            value={activeModule.releaseDate || ''}
                            onChange={(e) => updateModule(activeModule.id, { releaseDate: e.target.value })}
                            className="bg-[#0f1419] border border-gray-700 rounded p-2 text-white text-sm focus:border-yellow-500 outline-none"
                        />
                        {activeModule.releaseDate && (
                            <button 
                                onClick={() => updateModule(activeModule.id, { releaseDate: undefined })}
                                className="ml-2 text-xs text-red-400 hover:underline"
                            >
                                Limpar (Liberar agora)
                            </button>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Capa do Módulo</label>
                        <div className="flex gap-4">
                            <div className="w-32 h-32 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden relative group">
                                {activeModule.coverImage ? (
                                    <img src={activeModule.coverImage} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-600" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-xs text-white">Alterar</span>
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleModuleImageUpload(e, activeModule.id)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            <div className="flex-1 text-sm text-gray-500">
                                <p>Carregue uma imagem para representar este módulo na grade da área de membros.</p>
                                <p className="mt-2 text-xs">Recomendado: 600x400px (JPG, PNG)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* 3. LESSON EDITOR */}
        {activeLessonData && selectedId && activeModule && (
            <div className="flex-1 overflow-y-auto p-8 animate-in fade-in">
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                         <h2 className="text-xl font-bold text-white">Editar Aula</h2>
                         <button 
                            onClick={() => deleteLesson(activeModule.id, activeLessonData.id)}
                            className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                         >
                             <Trash2 className="w-4 h-4" />
                         </button>
                    </div>

                    {/* Titulo */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Título da Aula</label>
                        <input 
                            value={activeLessonData.title}
                            onChange={(e) => updateLesson(activeModule.id, activeLessonData.id, { title: e.target.value })}
                            className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white text-lg font-bold outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Video Selection */}
                    <div className="bg-[#0f1419] p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-blue-400">
                                <Video className="w-4 h-4" />
                                <span className="text-sm font-bold">Conteúdo em Vídeo</span>
                            </div>
                            <div className="flex bg-gray-800 rounded p-1">
                                <button 
                                    onClick={() => updateLesson(activeModule.id, activeLessonData.id, { videoSource: 'external' })}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${activeLessonData.videoSource !== 'local' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                                >
                                    Link Externo
                                </button>
                                <button 
                                    onClick={() => updateLesson(activeModule.id, activeLessonData.id, { videoSource: 'local' })}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${activeLessonData.videoSource === 'local' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                                >
                                    Upload (PC)
                                </button>
                            </div>
                        </div>

                        {activeLessonData.videoSource === 'local' ? (
                            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors relative">
                                <HardDrive className="w-8 h-8 text-gray-500 mb-2" />
                                <span className="text-sm text-gray-400 mb-1">Carregar vídeo do computador (Máx 600MB)</span>
                                <span className="text-xs text-gray-600">MP4, MOV, WEBM</span>
                                <input 
                                    type="file" 
                                    onChange={(e) => handleVideoUpload(e, activeModule.id, activeLessonData.id)} 
                                    accept="video/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {videoUploadProgress > 0 && (
                                    <div className="w-full mt-4 bg-gray-800 rounded-full h-2 overflow-hidden">
                                        <div className="bg-blue-500 h-full transition-all duration-200" style={{ width: `${videoUploadProgress}%` }}></div>
                                    </div>
                                )}
                                {activeLessonData.videoBlobUrl && videoUploadProgress === 0 && (
                                    <div className="mt-4 flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded text-xs">
                                        <Check className="w-3 h-3" /> Vídeo carregado
                                    </div>
                                )}
                            </div>
                        ) : (
                            <input 
                                value={activeLessonData.videoUrl || ''}
                                onChange={(e) => updateLesson(activeModule.id, activeLessonData.id, { videoUrl: e.target.value })}
                                placeholder="Cole aqui o link do vídeo (YouTube, Vimeo, etc)"
                                className="w-full bg-[#1e2329] border border-gray-700 rounded-lg p-3 text-white text-sm outline-none focus:border-blue-500"
                            />
                        )}
                    </div>

                    {/* Lesson Thumbnail */}
                    <div className="bg-[#0f1419] p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 mb-3 text-purple-400">
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-sm font-bold">Thumbnail da Aula (Capa)</span>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="w-24 h-16 bg-gray-800 rounded border border-gray-700 flex items-center justify-center overflow-hidden relative group">
                                {activeLessonData.coverImage ? (
                                    <img src={activeLessonData.coverImage} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-gray-600" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                    <UploadCloud className="w-4 h-4 text-white" />
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => handleLessonImageUpload(e, activeModule.id, activeLessonData.id)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            <span className="text-xs text-gray-500">Exibida na lista de aulas do módulo.</span>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Descrição / Texto de Apoio</label>
                        <textarea 
                            rows={4}
                            value={activeLessonData.description || ''}
                            onChange={(e) => updateLesson(activeModule.id, activeLessonData.id, { description: e.target.value })}
                            className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white text-sm outline-none focus:border-gray-500"
                            placeholder="Escreva um resumo da aula aqui..."
                        />
                    </div>

                    {/* Materiais */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label className="block text-xs font-bold text-gray-500">Material de Apoio (Downloads e Links)</label>
                             <div className="flex gap-2">
                                 <button onClick={() => addMaterial(activeModule.id, activeLessonData.id, 'link')} className="text-xs text-blue-400 hover:text-white flex items-center gap-1">
                                     <LinkIcon className="w-3 h-3" /> + Link
                                 </button>
                                 <button onClick={() => addMaterial(activeModule.id, activeLessonData.id, 'file')} className="text-xs text-emerald-400 hover:text-white flex items-center gap-1">
                                     <UploadCloud className="w-3 h-3" /> + Arquivo
                                 </button>
                             </div>
                        </div>

                        <div className="space-y-2">
                            {activeLessonData.materials?.map(material => (
                                <div key={material.id} className="flex items-center gap-3 bg-[#0f1419] border border-gray-800 p-3 rounded-lg group">
                                    {material.type === 'link' ? <LinkIcon className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-emerald-500" />}
                                    
                                    {material.type === 'link' ? (
                                        <input 
                                            value={material.url}
                                            onChange={(e) => {
                                                const newMaterials = activeLessonData.materials!.map(m => m.id === material.id ? { ...m, url: e.target.value } : m);
                                                updateLesson(activeModule.id, activeLessonData.id, { materials: newMaterials });
                                            }}
                                            placeholder="https://"
                                            className="bg-transparent border-none text-sm text-blue-400 flex-1 outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-300 flex-1 truncate">{material.title}</span>
                                    )}

                                    <button 
                                        onClick={() => removeMaterial(activeModule.id, activeLessonData.id, material.id)}
                                        className="text-gray-600 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {(!activeLessonData.materials || activeLessonData.materials.length === 0) && (
                                <div className="text-center py-4 border border-dashed border-gray-800 rounded-lg text-xs text-gray-600">
                                    Nenhum material adicionado.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Configs */}
                    <div className="border-t border-gray-800 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={activeLessonData.allowComments}
                                onChange={(e) => updateLesson(activeModule.id, activeLessonData.id, { allowComments: e.target.checked })}
                                className="rounded bg-gray-800 border-gray-700 text-emerald-500 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-300 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-gray-500" />
                                Permitir comentários nesta aula
                            </span>
                        </label>
                    </div>

                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default CourseBuilder;
