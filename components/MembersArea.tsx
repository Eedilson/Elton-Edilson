
import React, { useState, useEffect } from 'react';
import { Product, CourseModule, CourseLesson, Course } from '../types';
import { PlayCircle, Lock, MonitorPlay, ChevronRight, FileText, Download, Plus, Edit, Trash2, ArrowLeft, Save, Eye, X, Image as ImageIcon, UploadCloud, Users, MessageSquare, Mail, Phone, Search, CheckCircle } from 'lucide-react';
import { SimbaCloud } from '../services/cloudService';
import CourseBuilder from './CourseBuilder';

interface MembersAreaProps {
  products: Product[];
}

// Mock Data for Students
const MOCK_STUDENTS = [
    { id: '1', name: 'Carlos Macuácua', email: 'carlos.m@gmail.com', phone: '258841234567', progress: 75, joinedAt: '10/01/2025', lastAccess: 'Hoje' },
    { id: '2', name: 'Ana Paula', email: 'ana.paula@hotmail.com', phone: '258829876543', progress: 30, joinedAt: '12/01/2025', lastAccess: 'Ontem' },
    { id: '3', name: 'Fernando Sitoe', email: 'fernando.s@outlook.com', phone: '258861112222', progress: 100, joinedAt: '05/01/2025', lastAccess: '15/01/2025' },
    { id: '4', name: 'Beatriz Mondlane', email: 'bia.mondlane@gmail.com', phone: '258845556666', progress: 10, joinedAt: '18/01/2025', lastAccess: 'Hoje' },
];

// Mock Data for Comments/Doubts
const MOCK_COMMENTS = [
    { id: '1', studentId: '2', studentName: 'Ana Paula', lessonTitle: 'Aula 1: Boas Vindas', text: 'Professor, o material complementar não está abrindo aqui.', date: 'Ontem, 14:30', reply: '' },
    { id: '2', studentId: '1', studentName: 'Carlos Macuácua', lessonTitle: 'Aula 3: Configurando o Pixel', text: 'Pode explicar melhor a parte do evento de Purchase?', date: '10/01/2025', reply: 'Claro Carlos! No vídeo aos 5:30 eu mostro exatamente onde colar o código.' },
];

const MembersArea: React.FC<MembersAreaProps> = ({ products }) => {
  // Modes: 'list' (My Courses), 'create' (New Course Metadata), 'edit_content' (CourseBuilder), 
  // 'student_home' (Course Banner + Modules Grid), 'student_player' (Video + Sidebar),
  // 'manage_students' (New View)
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit_content' | 'student_home' | 'student_player' | 'manage_students'>('list');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Student Management State
  const [activeManageTab, setActiveManageTab] = useState<'students' | 'comments'>('students');
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [replyText, setReplyText] = useState<{[key: string]: string}>({});

  // New Course Form State
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseCover, setNewCourseCover] = useState<string>('');

  // Load courses on mount
  useEffect(() => {
      loadCourses();
  }, []);

  const loadCourses = async () => {
      const loaded = await SimbaCloud.getCourses();
      setCourses(loaded);
  };

  const handleCreateCourse = async () => {
      if (!newCourseName) return alert("Digite o nome do curso");
      const newCourse: Course = {
          id: Date.now().toString(),
          title: newCourseName,
          description: newCourseDesc,
          coverImage: newCourseCover,
          createdAt: new Date().toISOString(),
          modules: []
      };
      
      const saved = await SimbaCloud.saveCourse(newCourse);
      setCourses([...courses, saved]);
      setSelectedCourse(saved);
      setViewMode('edit_content');
      setNewCourseName('');
      setNewCourseDesc('');
      setNewCourseCover('');
  };

  const handleSaveContent = async (updatedModules: CourseModule[], updatedWelcomeVideo?: string, welcomeSource?: 'external' | 'local', welcomeBlob?: string) => {
      if (selectedCourse) {
          const updatedCourse = { 
              ...selectedCourse, 
              modules: updatedModules,
              welcomeVideoUrl: updatedWelcomeVideo ?? selectedCourse.welcomeVideoUrl,
              welcomeVideoSource: welcomeSource ?? selectedCourse.welcomeVideoSource,
              welcomeVideoBlobUrl: welcomeBlob ?? selectedCourse.welcomeVideoBlobUrl
          };
          await SimbaCloud.saveCourse(updatedCourse);
          setSelectedCourse(updatedCourse);
          // Update local list
          setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
          alert("Conteúdo salvo com sucesso!");
      }
  };

  const handleDeleteCourse = async (id: string) => {
      if (confirm("Tem certeza que deseja apagar este curso? Esta ação não pode ser desfeita.")) {
          await SimbaCloud.deleteCourse(id);
          setCourses(courses.filter(c => c.id !== id));
      }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const url = await SimbaCloud.uploadImage(e.target.files[0]);
          setNewCourseCover(url);
      }
  };

  // Helper para vídeo preview
  const getEmbedUrl = (url: string) => {
      if (!url) return '';
      const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regExp);
      if (match && match[1]) {
          return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1&playsinline=1`;
      }
      return url; 
  };

  const playLesson = (lesson: CourseLesson) => {
      setActiveLesson(lesson);
      setViewMode('student_player');
  };

  // Helper check locked
  const isModuleLocked = (module: CourseModule) => {
      if (!module.releaseDate) return false;
      const release = new Date(module.releaseDate);
      const now = new Date();
      return release > now;
  };

  // --- ACTIONS: STUDENT MANAGEMENT ---
  const handleContactStudent = (type: 'whatsapp' | 'email', contact: string) => {
      if (type === 'whatsapp') {
          window.open(`https://wa.me/${contact}`, '_blank');
      } else {
          window.location.href = `mailto:${contact}`;
      }
  };

  const handleReplyComment = (commentId: string) => {
      const text = replyText[commentId];
      if (!text) return;
      
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, reply: text } : c));
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      alert("Resposta enviada com sucesso!");
  };

  // --- VIEW: LIST (Dashboard of Courses) ---
  if (viewMode === 'list') {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Área de Membros</h2>
                    <p className="text-gray-400">Crie e gerencie o conteúdo dos seus cursos.</p>
                  </div>
                  <button 
                    onClick={() => setViewMode('create')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                  >
                      <Plus className="w-5 h-5" /> Novo Curso
                  </button>
              </div>

              {courses.length === 0 ? (
                  <div className="text-center py-20 bg-[#1e2329] rounded-xl border border-gray-800 flex flex-col items-center">
                      <div className="bg-gray-800 p-4 rounded-full mb-4">
                        <MonitorPlay className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Nenhum curso encontrado</h3>
                      <p className="text-gray-500 mt-2 mb-6 max-w-sm">
                          Comece criando seu primeiro curso. Depois você poderá conectá-lo a um produto para vender.
                      </p>
                      <button 
                        onClick={() => setViewMode('create')}
                        className="text-emerald-500 font-bold hover:underline"
                      >
                          Criar meu primeiro curso
                      </button>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map(course => (
                          <div key={course.id} className="bg-[#1e2329] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group flex flex-col">
                              <div className="h-40 bg-gray-800 relative">
                                  {course.coverImage ? (
                                      <img src={course.coverImage} className="w-full h-full object-cover" />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold bg-gradient-to-br from-gray-800 to-black">
                                          <MonitorPlay className="w-12 h-12 opacity-50" />
                                      </div>
                                  )}
                                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => { setSelectedCourse(course); setViewMode('edit_content'); }}
                                        className="p-2 bg-black/70 text-white rounded hover:bg-emerald-600 transition-colors" title="Editar Conteúdo"
                                      >
                                          <Edit className="w-4 h-4" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteCourse(course.id)}
                                        className="p-2 bg-black/70 text-white rounded hover:bg-red-600 transition-colors" title="Excluir"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              </div>
                              <div className="p-5 flex-1 flex flex-col">
                                  <h3 className="font-bold text-white truncate text-lg mb-1">{course.title}</h3>
                                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{course.description || "Sem descrição"}</p>
                                  
                                  <div className="mt-auto pt-4 border-t border-gray-800 flex flex-col gap-3">
                                      <div className="flex justify-between items-center">
                                          <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded">
                                              {course.modules?.length || 0} Módulos
                                          </span>
                                          <button 
                                            onClick={() => { setSelectedCourse(course); setViewMode('manage_students'); }}
                                            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                          >
                                              <Users className="w-3 h-3" /> Alunos & Dúvidas
                                          </button>
                                      </div>
                                      <button 
                                        onClick={() => { 
                                            setSelectedCourse(course); 
                                            setViewMode('student_home'); 
                                        }}
                                        className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors"
                                      >
                                          <Eye className="w-3 h-3" /> Visualizar Área de Alunos
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  }

  // --- VIEW: CREATE (Simple Form) ---
  if (viewMode === 'create') {
      return (
          <div className="flex items-center justify-center min-h-[600px]">
              <div className="bg-[#1e2329] p-8 rounded-xl border border-gray-800 w-full max-w-lg">
                  <h2 className="text-2xl font-bold text-white mb-6">Criar Novo Curso</h2>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Capa do Curso</label>
                          <div className="flex gap-4">
                              <div className="w-24 h-24 bg-gray-800 rounded border border-gray-700 flex items-center justify-center overflow-hidden relative">
                                  {newCourseCover ? (
                                      <img src={newCourseCover} className="w-full h-full object-cover" />
                                  ) : (
                                      <ImageIcon className="w-8 h-8 text-gray-600" />
                                  )}
                                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                              <div className="flex-1 flex flex-col justify-center">
                                  <button className="text-emerald-500 text-sm font-bold flex items-center gap-2 mb-1 relative">
                                      <UploadCloud className="w-4 h-4" /> Upload Capa
                                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                  </button>
                                  <span className="text-xs text-gray-500">1920x1080px recomendado</span>
                              </div>
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Nome do Curso</label>
                          <input 
                            value={newCourseName}
                            onChange={e => setNewCourseName(e.target.value)}
                            placeholder="Ex: Curso Completo de Marketing"
                            className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-400 mb-2">Descrição Curta</label>
                          <textarea 
                            value={newCourseDesc}
                            onChange={e => setNewCourseDesc(e.target.value)}
                            placeholder="O que os alunos vão aprender..."
                            rows={3}
                            className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none resize-none"
                          />
                      </div>
                      <div className="flex gap-3 pt-4">
                          <button 
                            onClick={() => setViewMode('list')}
                            className="flex-1 py-3 text-gray-400 hover:bg-gray-800 rounded-lg font-bold"
                          >
                              Cancelar
                          </button>
                          <button 
                            onClick={handleCreateCourse}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-lg"
                          >
                              Criar e Editar Conteúdo
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- VIEW: EDIT CONTENT (Course Builder) ---
  if (viewMode === 'edit_content' && selectedCourse) {
      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setViewMode('list')} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800">
                          <ArrowLeft className="w-6 h-6" />
                      </button>
                      <div>
                          <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                          <p className="text-sm text-gray-500">Editando estrutura e aulas</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setViewMode('list')}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                      Voltar para lista
                  </button>
              </div>

              <CourseBuilder 
                  modules={selectedCourse.modules || []}
                  welcomeVideoUrl={selectedCourse.welcomeVideoUrl}
                  welcomeVideoSource={selectedCourse.welcomeVideoSource}
                  welcomeVideoBlobUrl={selectedCourse.welcomeVideoBlobUrl}
                  
                  onUpdateModules={(newModules) => handleSaveContent(newModules)}
                  onUpdateWelcomeVideo={(url, source, blobUrl) => handleSaveContent(selectedCourse.modules, url, source, blobUrl)}
              />
          </div>
      );
  }

  // --- VIEW: MANAGE STUDENTS & COMMENTS ---
  if (viewMode === 'manage_students' && selectedCourse) {
      return (
          <div className="space-y-6 animate-in fade-in">
              {/* Header */}
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setViewMode('list')} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800">
                          <ArrowLeft className="w-6 h-6" />
                      </button>
                      <div>
                          <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                          <p className="text-sm text-gray-500">Gestão de Alunos e Comunidade</p>
                      </div>
                  </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-800">
                  <button 
                    onClick={() => setActiveManageTab('students')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeManageTab === 'students' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'}`}
                  >
                      <Users className="w-4 h-4" /> Alunos Inscritos
                  </button>
                  <button 
                    onClick={() => setActiveManageTab('comments')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeManageTab === 'comments' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-white'}`}
                  >
                      <MessageSquare className="w-4 h-4" /> Dúvidas e Comentários
                  </button>
              </div>

              {/* TAB CONTENT: STUDENTS */}
              {activeManageTab === 'students' && (
                  <div className="bg-[#1e2329] border border-gray-800 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#161b22]">
                          <div className="relative w-64">
                              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
                              <input 
                                placeholder="Buscar aluno..." 
                                className="w-full bg-[#0f1419] border border-gray-700 rounded-lg py-2 pl-10 text-sm text-white focus:border-blue-500 outline-none"
                              />
                          </div>
                          <div className="text-sm text-gray-400">
                              Total: <span className="font-bold text-white">{MOCK_STUDENTS.length}</span>
                          </div>
                      </div>
                      <table className="w-full text-left">
                          <thead className="bg-[#161b22] border-b border-gray-800 text-xs font-bold text-gray-500 uppercase">
                              <tr>
                                  <th className="px-6 py-4">Nome</th>
                                  <th className="px-6 py-4">Progresso</th>
                                  <th className="px-6 py-4">Entrou em</th>
                                  <th className="px-6 py-4">Último Acesso</th>
                                  <th className="px-6 py-4 text-right">Contato</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800 text-sm">
                              {MOCK_STUDENTS.map(student => (
                                  <tr key={student.id} className="hover:bg-[#252b33] transition-colors">
                                      <td className="px-6 py-4">
                                          <div className="font-bold text-white">{student.name}</div>
                                          <div className="text-xs text-gray-500">{student.email}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                                                  <div className="h-full bg-emerald-500" style={{ width: `${student.progress}%` }}></div>
                                              </div>
                                              <span className="text-xs font-mono text-gray-300">{student.progress}%</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-gray-400">{student.joinedAt}</td>
                                      <td className="px-6 py-4 text-gray-400">{student.lastAccess}</td>
                                      <td className="px-6 py-4 text-right">
                                          <div className="flex justify-end gap-2">
                                              <button 
                                                onClick={() => handleContactStudent('whatsapp', student.phone)}
                                                className="p-2 bg-[#0f1419] border border-gray-700 rounded text-emerald-500 hover:text-white hover:bg-emerald-600 transition-colors" title="WhatsApp"
                                              >
                                                  <Phone className="w-4 h-4" />
                                              </button>
                                              <button 
                                                onClick={() => handleContactStudent('email', student.email)}
                                                className="p-2 bg-[#0f1419] border border-gray-700 rounded text-blue-500 hover:text-white hover:bg-blue-600 transition-colors" title="E-mail"
                                              >
                                                  <Mail className="w-4 h-4" />
                                              </button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}

              {/* TAB CONTENT: COMMENTS */}
              {activeManageTab === 'comments' && (
                  <div className="space-y-4">
                      {comments.map(comment => (
                          <div key={comment.id} className="bg-[#1e2329] border border-gray-800 rounded-xl p-6">
                              <div className="flex justify-between items-start mb-4">
                                  <div className="flex gap-3">
                                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold text-white">
                                          {comment.studentName[0]}
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-white text-sm">{comment.studentName}</h4>
                                          <p className="text-xs text-gray-500">{comment.date} • em <span className="text-blue-400">{comment.lessonTitle}</span></p>
                                      </div>
                                  </div>
                                  {!comment.reply && <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded border border-yellow-500/20">Pendente</span>}
                              </div>
                              
                              <p className="text-gray-300 text-sm mb-4 bg-[#161b22] p-3 rounded-lg border border-gray-800">
                                  "{comment.text}"
                              </p>

                              {comment.reply ? (
                                  <div className="ml-10 bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-lg">
                                      <div className="flex items-center gap-2 mb-1">
                                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                                          <span className="text-xs font-bold text-emerald-500">Sua Resposta</span>
                                      </div>
                                      <p className="text-sm text-gray-300">{comment.reply}</p>
                                  </div>
                              ) : (
                                  <div className="ml-10">
                                      <textarea 
                                          value={replyText[comment.id] || ''}
                                          onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                                          placeholder="Escreva uma resposta..."
                                          className="w-full bg-[#0f1419] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none resize-none mb-2"
                                          rows={2}
                                      />
                                      <button 
                                        onClick={() => handleReplyComment(comment.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                                      >
                                          Enviar Resposta
                                      </button>
                                  </div>
                              )}
                          </div>
                      ))}
                      {comments.length === 0 && (
                          <div className="text-center py-10 text-gray-500">
                              Nenhum comentário ou dúvida por enquanto.
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  }

  // --- VIEW: STUDENT HOME (NETFLIX STYLE) ---
  if (viewMode === 'student_home' && selectedCourse) {
      return (
          <div className="bg-[#0f1419] min-h-screen animate-in fade-in absolute inset-0 z-50 overflow-y-auto">
              
              {/* Back Button Overlay */}
              <button 
                  onClick={() => setViewMode('list')}
                  className="fixed top-6 left-6 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all"
              >
                  <ArrowLeft className="w-6 h-6" />
              </button>

              {/* Banner / Hero Section */}
              <div className="relative h-[60vh] w-full">
                  {selectedCourse.coverImage ? (
                      <img src={selectedCourse.coverImage} className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                          <MonitorPlay className="w-24 h-24 text-gray-700 opacity-20" />
                      </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-[#0f1419]/60 to-transparent"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-4xl">
                      <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">{selectedCourse.title}</h1>
                      <p className="text-gray-300 text-lg md:text-xl mb-8 line-clamp-3 drop-shadow-md">{selectedCourse.description}</p>
                      
                      <div className="flex gap-4">
                          {(selectedCourse.welcomeVideoUrl || selectedCourse.welcomeVideoBlobUrl) && (
                              <button 
                                  onClick={() => setShowWelcomeModal(true)}
                                  className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg"
                              >
                                  <PlayCircle className="w-6 h-6" /> Começar (Boas-vindas)
                              </button>
                          )}
                          {selectedCourse.modules?.[0]?.lessons?.[0] && (
                              <button 
                                  onClick={() => {
                                      if (!isModuleLocked(selectedCourse.modules[0])) {
                                          playLesson(selectedCourse.modules[0].lessons[0]);
                                      } else {
                                          alert("O primeiro módulo está bloqueado.");
                                      }
                                  }}
                                  className="bg-gray-600/80 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 backdrop-blur-md transition-colors"
                              >
                                  Ir para Aulas
                              </button>
                          )}
                      </div>
                  </div>
              </div>

              {/* Modules Grid */}
              <div className="p-8 md:p-16 -mt-10 relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-6">Módulos do Curso</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {selectedCourse.modules?.map((module, idx) => {
                          const locked = isModuleLocked(module);
                          return (
                            <div 
                                key={module.id} 
                                onClick={() => {
                                    if (locked) return alert(`Módulo bloqueado até ${module.releaseDate}`);
                                    if (module.lessons.length > 0) playLesson(module.lessons[0]);
                                    else alert("Este módulo ainda não tem aulas.");
                                }}
                                className={`group cursor-pointer ${locked ? 'opacity-60 grayscale' : ''}`}
                            >
                                {/* Module Cover */}
                                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden border border-gray-800 group-hover:border-emerald-500/50 group-hover:scale-105 transition-all duration-300 relative">
                                    {module.coverImage ? (
                                        <img src={module.coverImage} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <span className="text-4xl font-bold text-gray-800">{idx + 1}</span>
                                        </div>
                                    )}
                                    
                                    {/* Locked Overlay or Play Overlay */}
                                    {locked ? (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <Lock className="w-12 h-12 text-white/50" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-bold text-white text-lg group-hover:text-emerald-500 transition-colors truncate">{module.title}</h3>
                                        {locked && <Lock className="w-4 h-4 text-gray-500" />}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {locked ? `Disponível em ${module.releaseDate}` : `${module.lessons.length} Aulas`}
                                    </p>
                                </div>
                            </div>
                          );
                      })}
                  </div>
              </div>

              {/* Welcome Video Modal */}
              {showWelcomeModal && (selectedCourse.welcomeVideoUrl || selectedCourse.welcomeVideoBlobUrl) && (
                  <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                      <div className="w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl border border-gray-800">
                          <button 
                              onClick={() => setShowWelcomeModal(false)}
                              className="absolute top-4 right-4 z-10 text-white bg-black/50 p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                              <X className="w-6 h-6" />
                          </button>
                          
                          {selectedCourse.welcomeVideoSource === 'local' && selectedCourse.welcomeVideoBlobUrl ? (
                              <video 
                                src={selectedCourse.welcomeVideoBlobUrl} 
                                className="w-full h-full"
                                controls
                                autoPlay
                              ></video>
                          ) : (
                              <iframe 
                                  src={getEmbedUrl(selectedCourse.welcomeVideoUrl!) + "&autoplay=1"} 
                                  className="w-full h-full"
                                  allow="autoplay; fullscreen"
                                  allowFullScreen
                              ></iframe>
                          )}
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // --- VIEW: STUDENT PLAYER (LESSON VIEW) ---
  if (viewMode === 'student_player' && selectedCourse) {
      return (
        <div className="flex flex-col h-screen bg-[#0f1419] overflow-hidden fixed inset-0 z-50">
            {/* Header */}
            <div className="bg-[#161b22] p-4 border-b border-gray-800 flex items-center gap-4 shrink-0">
                <button 
                    onClick={() => setViewMode('student_home')}
                    className="text-gray-400 hover:text-white flex items-center gap-2"
                >
                    <ArrowLeft className="w-5 h-5" /> Voltar ao Curso
                </button>
                <div className="h-6 w-px bg-gray-700"></div>
                <h2 className="font-bold text-white text-lg truncate">{selectedCourse.title}</h2>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content (Video) */}
                <div className="flex-1 overflow-y-auto bg-black flex flex-col custom-scrollbar">
                    {activeLesson ? (
                        <>
                            <div className="w-full bg-black relative" style={{ aspectRatio: '16/9' }}>
                                {activeLesson.videoSource === 'local' && activeLesson.videoBlobUrl ? (
                                    <video controls className="w-full h-full" src={activeLesson.videoBlobUrl}></video>
                                ) : activeLesson.videoUrl ? (
                                    <iframe 
                                        src={getEmbedUrl(activeLesson.videoUrl)} 
                                        className="w-full h-full" 
                                        allowFullScreen
                                        frameBorder="0"
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500">
                                        <MonitorPlay className="w-16 h-16 mb-4 opacity-50" />
                                        <span className="text-lg font-medium">Sem vídeo nesta aula</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-8 max-w-5xl mx-auto w-full">
                                <h1 className="text-3xl font-bold text-white mb-4">{activeLesson.title}</h1>
                                
                                {activeLesson.description && (
                                    <div className="text-gray-300 text-base mb-8 leading-relaxed bg-[#161b22] p-6 rounded-xl border border-gray-800">
                                        {activeLesson.description}
                                    </div>
                                )}

                                {activeLesson.materials && activeLesson.materials.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Materiais de Apoio</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activeLesson.materials.map(mat => (
                                                <a 
                                                    key={mat.id} 
                                                    href={mat.url} 
                                                    target="_blank"
                                                    className="flex items-center gap-4 p-4 bg-[#1e2329] border border-gray-800 rounded-xl hover:border-emerald-500/50 hover:bg-[#252b33] transition-all group"
                                                >
                                                    <div className="p-3 bg-gray-800 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                                                        {mat.type === 'link' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                    </div>
                                                    <span className="text-sm text-gray-300 font-medium flex-1 truncate">{mat.title}</span>
                                                    <Download className="w-5 h-5 text-gray-600 group-hover:text-white" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Selecione uma aula para assistir
                        </div>
                    )}
                </div>

                {/* Sidebar Modules */}
                <div className="w-96 bg-[#161b22] border-l border-gray-800 overflow-y-auto custom-scrollbar shrink-0 hidden lg:block">
                    <div className="p-4 border-b border-gray-800">
                        <h3 className="font-bold text-white">Conteúdo do Curso</h3>
                        <p className="text-xs text-gray-500 mt-1">{selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Aulas</p>
                    </div>
                    {selectedCourse.modules?.map((module, mIdx) => {
                        const locked = isModuleLocked(module);
                        return (
                            <div key={module.id} className={`border-b border-gray-800/50 ${locked ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div className="p-4 bg-gray-800/30 text-sm font-bold text-gray-200 sticky top-0 backdrop-blur-sm z-10 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-xs text-gray-500">{mIdx + 1}</span>
                                        {module.title}
                                    </div>
                                    {locked && <Lock className="w-3 h-3 text-gray-500" />}
                                </div>
                                {!locked && (
                                    <div>
                                        {module.lessons.map((lesson, lIdx) => (
                                            <div 
                                                key={lesson.id}
                                                onClick={() => setActiveLesson(lesson)}
                                                className={`p-4 flex gap-3 cursor-pointer transition-colors border-l-2 ${
                                                    activeLesson?.id === lesson.id 
                                                    ? 'bg-emerald-500/10 border-l-emerald-500' 
                                                    : 'border-l-transparent hover:bg-gray-800/50'
                                                }`}
                                            >
                                                {/* Lesson Thumbnail in List */}
                                                <div className="w-16 h-10 bg-gray-800 rounded overflow-hidden flex-shrink-0 relative">
                                                    {lesson.coverImage ? (
                                                        <img src={lesson.coverImage} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <PlayCircle className="w-4 h-4 text-gray-600" />
                                                        </div>
                                                    )}
                                                    {activeLesson?.id === lesson.id && (
                                                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className={`text-sm font-medium truncate ${activeLesson?.id === lesson.id ? 'text-emerald-400' : 'text-gray-300'}`}>
                                                        {lesson.title}
                                                    </div>
                                                    <div className="text-[10px] text-gray-600 mt-1 flex items-center gap-1">
                                                        <MonitorPlay className="w-3 h-3" /> Aula {lIdx + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      );
  }

  return null;
};

export default MembersArea;
