import React, { useState, useEffect } from 'react';
import { Product, Offer, Coproducer } from '../types';
import { SimbaCloud } from '../services/cloudService';
import { 
  Save, X, Image as ImageIcon, Link as LinkIcon, 
  Settings, Check, Copy, Layout,
  FileText, Smartphone, MonitorPlay, UploadCloud, CheckCircle, CreditCard, PaintBucket, ArrowRight, Video, Plus, Trash2, Users, Mail, Instagram
} from 'lucide-react';

interface CreateProductProps {
  productToEdit?: Product | null; // Optional prop for editing
  onProductCreated: (product: Product) => void;
  onCancel: () => void;
  onEditCheckout: (product: Product) => void;
}

type Tab = 'type' | 'geral' | 'checkout' | 'coproducao' | 'links' | 'afiliados';

const CreateProduct: React.FC<CreateProductProps> = ({ productToEdit, onProductCreated, onCancel, onEditCheckout }) => {
  const [activeTab, setActiveTab] = useState<Tab>(productToEdit ? 'geral' : 'type'); 
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(productToEdit?.imageUrl || null);

  // Initial Form State
  const initialData: Partial<Product> = productToEdit ? { ...productToEdit } : {
    id: Date.now().toString(),
    name: '',
    description: '',
    price: 0,
    offers: [{ id: '1', name: 'Oferta Principal', price: 0, isDefault: true }],
    coproducers: [],
    paymentType: 'unique',
    salesPageUrl: '',
    category: 'Educacional',
    status: 'active',
    productType: 'ebook',
    checkoutConfig: {
      components: ['header', 'form', 'seal'],
      primaryColor: '#10b981',
      showCountdown: false,
      showTestimonials: false,
    }
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialData);

  // Coproducer Local State
  const [newCoEmail, setNewCoEmail] = useState('');
  const [newCoPercent, setNewCoPercent] = useState('');

  // Offer Local State
  const handleOfferChange = (index: number, field: keyof Offer, value: any) => {
      const updatedOffers = [...(formData.offers || [])];
      updatedOffers[index] = { ...updatedOffers[index], [field]: value };
      
      // Update main price if it's the default offer
      let mainPrice = formData.price;
      if (updatedOffers[index].isDefault) {
          mainPrice = Number(updatedOffers[index].price);
      }
      
      setFormData(prev => ({ ...prev, offers: updatedOffers, price: mainPrice }));
  };

  const addOffer = () => {
      const newOffer: Offer = {
          id: Date.now().toString(),
          name: 'Nova Oferta',
          price: 0,
          isDefault: false
      };
      setFormData(prev => ({ ...prev, offers: [...(prev.offers || []), newOffer] }));
  };

  const removeOffer = (index: number) => {
      const updated = [...(formData.offers || [])];
      if (updated.length === 1) return alert("Você precisa ter pelo menos uma oferta.");
      updated.splice(index, 1);
      setFormData(prev => ({ ...prev, offers: updated }));
  };

  // Input Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = await SimbaCloud.uploadImage(file);
      setPreviewImage(imageUrl);
      setFormData(prev => ({ ...prev, imageUrl }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const fileUrl = await SimbaCloud.uploadImage(file);
          setFormData(prev => ({ ...prev, productFile: fileUrl }));
      }
  };

  const handleTypeSelect = (type: 'ebook' | 'course' | 'application') => {
      setFormData(prev => ({ ...prev, productType: type }));
      setActiveTab('geral');
  };

  // Coproduction Logic
  const handleAddCoproducer = () => {
      if (!newCoEmail || !newCoPercent) return alert("Preencha email e porcentagem");
      const percent = Number(newCoPercent);
      if (percent <= 0 || percent > 90) return alert("Porcentagem inválida");

      const newCoproducer: Coproducer = {
          email: newCoEmail,
          percentage: percent,
          status: 'pending',
          invitedAt: new Date().toLocaleDateString()
      };

      setFormData(prev => ({
          ...prev,
          coproducers: [...(prev.coproducers || []), newCoproducer]
      }));
      setNewCoEmail('');
      setNewCoPercent('');
      alert(`Convite enviado para ${newCoEmail}. Aguardando confirmação.`);
  };

  const handleRemoveCoproducer = (email: string) => {
      setFormData(prev => ({
          ...prev,
          coproducers: prev.coproducers?.filter(c => c.email !== email)
      }));
  };

  const saveToCloud = async (skipValidation = false): Promise<Product | null> => {
    // Validation
    if (!skipValidation) {
        if (!formData.name) {
            alert("Por favor, preencha o Nome do Produto.");
            setActiveTab('geral');
            return null;
        }
        // Check offers instead of just price
        if (!formData.offers || formData.offers.length === 0 || formData.offers.some(o => Number(o.price) <= 0)) {
            alert("Por favor, defina um preço válido para suas ofertas.");
            setActiveTab('geral');
            return null;
        }
    }

    try {
        // Ensure offers are synced
        const offersToSave = formData.offers && formData.offers.length > 0 
            ? formData.offers 
            : [{ id: '1', name: 'Padrão', price: Number(formData.price), isDefault: true }];

        const finalProduct: Product = {
            id: formData.id!,
            name: formData.name || 'Produto Sem Nome',
            description: formData.description || '',
            price: Number(formData.price) || 0, // Legacy support
            offers: offersToSave,
            coproducers: formData.coproducers || [],
            format: formData.productType === 'ebook' ? 'PDF' : 'APP', 
            productType: formData.productType || 'ebook',
            productFile: formData.productFile,
            accessLink: formData.accessLink,
            salesCount: productToEdit?.salesCount || 0,
            revenue: productToEdit?.revenue || 0,
            status: 'active',
            dateCreated: productToEdit?.dateCreated || new Date().toISOString(),
            imageUrl: formData.imageUrl,
            category: formData.category,
            paymentType: formData.paymentType,
            checkoutConfig: formData.checkoutConfig,
            salesPageUrl: formData.salesPageUrl,
            // Links are generated by cloud service, but we preserve existing keys
            links: productToEdit?.links
        };
        const savedProduct = await SimbaCloud.saveProduct(finalProduct);
        setFormData(prev => ({ ...prev, ...savedProduct }));
        return savedProduct;
    } catch(e) {
        console.error(e);
        alert("Erro ao salvar");
        return null;
    }
  }

  const handleSave = async