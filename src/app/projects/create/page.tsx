"use client"

import React, { useState } from 'react';
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';

const MultiStepProjectForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    projectName: '',
    projectDescription: '',
    startDate: '',
    draftDeadline: '',
    finalDeadline: '',
    budget: '',
    clientPhone: '',
    // Step 2
    revisionCount: '',
    additionalRevisionFee: '',
    revisionCriteria: '',
    // Step 3
    paymentMethod: ''
  });

  // 분할 결제 관련 state
  const [installments, setInstallments] = useState([
    { id: 1, name: '계약금', percentage: 30, description: '프로젝트 시작 시' },
    { id: 2, name: '중간금', percentage: 40, description: '중간 단계 완료 시' },
    { id: 3, name: '잔금', percentage: 30, description: '최종 납품 완료 시' }
  ]);

  const [touched, setTouched] = useState({
    projectName: false,
    projectDescription: false,
    startDate: false,
    draftDeadline: false,
    finalDeadline: false,
    budget: false,
    clientPhone: false,
    revisionCount: false,
    additionalRevisionFee: false,
    revisionCriteria: false,
    paymentMethod: false
  });

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // 분할 결제 관련 함수들
  const addInstallment = () => {
    const newId = Math.max(...installments.map(i => i.id)) + 1;
    setInstallments([
      ...installments,
      { id: newId, name: `${newId}차 결제`, percentage: 0, description: '' }
    ]);
  };

  const removeInstallment = (id: number) => {
    if (installments.length > 1) {
      setInstallments(installments.filter(i => i.id !== id));
    }
  };

  const updateInstallment = (id: number, field: string, value: string | number) => {
    setInstallments(installments.map(i => 
      i.id === id ? { ...i, [field]: value } : i
    ));
  };

  const totalPercentage = installments.reduce((sum, i) => sum + i.percentage, 0);
  const remainingPercentage = 100 - totalPercentage;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getAlertVariant = () => {
    if (totalPercentage === 100) return 'default';
    if (totalPercentage > 100) return 'destructive';
    return 'default';
  };

  const getFieldError = (field: string) => {
    if (!touched[field as keyof typeof touched]) return '';
    if (!formData[field as keyof typeof formData]) {
      switch (field) {
        case 'projectName': return '프로젝트명을 입력해주세요.';
        case 'projectDescription': return '프로젝트 설명을 입력해주세요.';
        case 'startDate': return '프로젝트 시작일을 선택해주세요.';
        case 'draftDeadline': return '초안 마감일을 선택해주세요.';
        case 'finalDeadline': return '프로젝트 마감일을 선택해주세요.';
        case 'budget': return '비용을 입력해주세요.';
        case 'clientPhone': return '의뢰인 전화번호를 입력해주세요.';
        case 'revisionCount': return '수정 횟수를 입력해주세요.';
        case 'additionalRevisionFee': return '추가 수정 요금을 입력해주세요.';
        case 'revisionCriteria': return '수정 기준을 입력해주세요.';
        case 'paymentMethod': return '결제 방식을 선택해주세요.';
        default: return '';
      }
    }
    return '';
  };

  const nextStep = () => {
    // 현재 스텝의 모든 필드를 touched로 표시
    const currentStepFields = getCurrentStepFields();
    const newTouched = { ...touched };
    currentStepFields.forEach(field => {
      newTouched[field as keyof typeof touched] = true;
    });
    setTouched(newTouched);

    // 유효성 검사 통과시에만 다음 스텝으로 이동
    if (isStepValid() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const getCurrentStepFields = () => {
    switch (currentStep) {
      case 1:
        return ['projectName', 'projectDescription', 'startDate', 'draftDeadline', 'finalDeadline', 'budget', 'clientPhone'];
      case 2:
        return ['revisionCount', 'additionalRevisionFee', 'revisionCriteria'];
      case 3:
        return ['paymentMethod'];
      default:
        return [];
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // 현재 스텝의 모든 필드를 touched로 표시
    const currentStepFields = getCurrentStepFields();
    const newTouched = { ...touched };
    currentStepFields.forEach(field => {
      newTouched[field as keyof typeof touched] = true;
    });
    setTouched(newTouched);

    // 유효성 검사 통과시에만 제출
    if (isStepValid()) {
      console.log('프로젝트 생성:', formData);
      alert('프로젝트가 성공적으로 생성되었습니다!');
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.projectName && formData.projectDescription && formData.startDate && 
               formData.draftDeadline && formData.finalDeadline && formData.budget && formData.clientPhone;
      case 2:
        return formData.revisionCount && formData.additionalRevisionFee && formData.revisionCriteria;
      case 3:
        return formData.paymentMethod;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectName" className="mb-2.5 block">프로젝트명</Label>
        <Input
          id="projectName"
          placeholder="프로젝트명을 입력하세요"
          value={formData.projectName}
          onChange={(e) => handleInputChange('projectName', e.target.value)}
          onBlur={() => handleBlur('projectName')}
        />
        <div className="min-h-[32px]">
          {getFieldError('projectName') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('projectName')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="projectDescription" className="mb-2.5 block">프로젝트 설명</Label>
        <Textarea
          id="projectDescription"
          placeholder="프로젝트에 대한 상세 설명을 입력하세요"
          value={formData.projectDescription}
          onChange={(e) => {
            if (typeof e === 'string') {
              handleInputChange('projectDescription', e);
            } else {
              handleInputChange('projectDescription', e.target.value);
            }
          }}
          onBlur={() => handleBlur('projectDescription')}
          rows={6}
        />
        <div className="min-h-[32px]">
          {getFieldError('projectDescription') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('projectDescription')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate" className="mb-2.5 block">프로젝트 시작일</Label>
        <Input
          id="startDate"
          type="date"
          value={formData.startDate}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          onBlur={() => handleBlur('startDate')}
        />
        <div className="min-h-[32px]">
          {getFieldError('startDate') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('startDate')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="draftDeadline" className="mb-2.5 block">초안 마감일</Label>
        <Input
          id="draftDeadline"
          type="date"
          value={formData.draftDeadline}
          onChange={(e) => handleInputChange('draftDeadline', e.target.value)}
          onBlur={() => handleBlur('draftDeadline')}
        />
        <div className="min-h-[32px]">
          {getFieldError('draftDeadline') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('draftDeadline')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="finalDeadline" className="mb-2.5 block">프로젝트 마감일</Label>
        <Input
          id="finalDeadline"
          type="date"
          value={formData.finalDeadline}
          onChange={(e) => handleInputChange('finalDeadline', e.target.value)}
          onBlur={() => handleBlur('finalDeadline')}
        />
        <div className="min-h-[32px]">
          {getFieldError('finalDeadline') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('finalDeadline')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget" className="mb-2.5 block">비용 (원)</Label>
        <Input
          id="budget"
          type="number"
          placeholder="1000000"
          value={formData.budget}
          onChange={(e) => handleInputChange('budget', e.target.value)}
          onBlur={() => handleBlur('budget')}
        />
        <div className="min-h-[32px]">
          {getFieldError('budget') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('budget')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="clientPhone" className="mb-2.5 block">의뢰인 전화번호</Label>
        <Input
          id="clientPhone"
          placeholder="010-0000-0000"
          value={formData.clientPhone}
          onChange={(e) => handleInputChange('clientPhone', e.target.value)}
          onBlur={() => handleBlur('clientPhone')}
        />
        <div className="min-h-[32px]">
          {getFieldError('clientPhone') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('clientPhone')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="revisionCount" className="mb-2.5 block">수정 횟수</Label>
        <Input
          id="revisionCount"
          type="number"
          placeholder="3"
          value={formData.revisionCount}
          onChange={(e) => handleInputChange('revisionCount', e.target.value)}
          onBlur={() => handleBlur('revisionCount')}
        />
        <div className="min-h-[32px]">
          {getFieldError('revisionCount') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('revisionCount')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="additionalRevisionFee" className="mb-2.5 block">추가 수정 요금 (원)</Label>
        <Input
          id="additionalRevisionFee"
          type="number"
          placeholder="50000"
          value={formData.additionalRevisionFee}
          onChange={(e) => handleInputChange('additionalRevisionFee', e.target.value)}
          onBlur={() => handleBlur('additionalRevisionFee')}
        />
        <div className="min-h-[32px]">
          {getFieldError('additionalRevisionFee') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('additionalRevisionFee')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="revisionCriteria" className="mb-2.5 block">수정 기준</Label>
        <Textarea
          id="revisionCriteria"
          placeholder="수정 기준에 대한 상세 내용을 입력하세요"
          value={formData.revisionCriteria}
          onChange={(e) => {
            if (typeof e === 'string') {
              handleInputChange('revisionCriteria', e);
            } else {
              handleInputChange('revisionCriteria', e.target.value);
            }
          }}
          onBlur={() => handleBlur('revisionCriteria')}
          rows={6}
        />
        <div className="min-h-[32px]">
          {getFieldError('revisionCriteria') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('revisionCriteria')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const totalAmount = parseInt(formData.budget) || 0;
    
    return (
      <div className="space-y-6">
        {/* 총 금액 표시 */}
        {/* <div className="space-y-2 flex justify-between">
          <h3 className="text-lg font-semibold">프로젝트 총 금액</h3>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(totalAmount)}원
          </p>
        </div> */}

        {/* 결제 방식 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>결제 방식 선택</CardTitle>
            <CardDescription>일시불 또는 분할결제를 선택해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={formData.paymentMethod} 
              onValueChange={(value) => {
                handleInputChange('paymentMethod', value);
                handleBlur('paymentMethod');
              }}
            >
              <div className="space-y-4 flex flex-col gap-4">
                <Label htmlFor="lump-sum" className="cursor-pointer">
                  <Card className={`transition-all hover:shadow-md ${
                    formData.paymentMethod === 'lump-sum' ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="lump-sum" id="lump-sum" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-[16px]">일시불 결제</h4>
                          <p className="text-sm text-muted-foreground"></p>
                        </div>
                        {formData.paymentMethod === 'lump-sum' && <CheckCircle className="w-5 h-5 text-primary" />}

                      </div>
                      <div className="mt-4 flex justify-end">
                        <Badge variant="outline" className="text-lg font-bold border-none px-0">
                          {formatCurrency(totalAmount)}원
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Label>

                <Label htmlFor="installment" className="cursor-pointer">
                  <Card className={`transition-all hover:shadow-md ${
                    formData.paymentMethod === 'installment' ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="installment" id="installment" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-[16px]">분할 결제</h4>
                          <p className="text-sm text-muted-foreground"></p>
                        </div>
                        {formData.paymentMethod === 'installment' && <CheckCircle className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Badge variant="outline" className="text-lg font-bold border-none px-0">
                          {installments.length}단계 분할
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <div className="min-h-[32px]">
          {getFieldError('paymentMethod') && (
            <Alert variant="destructive" className="py-2 border-0 bg-transparent px-0 flex items-center gap-2 [&>svg]:static [&>svg]:translate-y-0 [&>svg~*]:pl-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0 !text-red-500" />
              <AlertDescription className="text-xs leading-4 h-2.5 text-red-500">
                {getFieldError('paymentMethod')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 분할결제 상세 설정 */}
        {formData.paymentMethod === 'installment' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>분할 결제 설정</CardTitle>
                  <CardDescription>각 단계별 결제 비율과 조건을 설정해주세요</CardDescription>
                </div>
                <Button onClick={addInstallment} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  단계 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {installments.map((installment, index) => (
                  <Card key={installment.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="w-8 h-8 rounded-md flex items-center justify-center font-bold bg-gray-200">
                          {index + 1}
                        </Badge>
                        {installments.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInstallment(installment.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`name-${installment.id}`} className="text-sm font-medium">
                          결제 단계명
                        </Label>
                        <Input
                          id={`name-${installment.id}`}
                          value={installment.name}
                          onChange={(e) => updateInstallment(installment.id, 'name', e.target.value)}
                          placeholder="결제 단계명"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`percentage-${installment.id}`} className="text-sm font-medium">
                          비율 (%)
                        </Label>
                        <div className="relative">
                          <Input
                            id={`percentage-${installment.id}`}
                            type="number"
                            value={installment.percentage}
                            onChange={(e) => updateInstallment(installment.id, 'percentage', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            min="0"
                            max="100"
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">결제 금액</Label>
                        <div className="flex items-center h-10 px-3 py-2 rounded-md border border-gray-300 bg-gray-50">
                          <span className="font-bold text-sm">
                            {formatCurrency(Math.round(totalAmount * installment.percentage / 100))}원
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`description-${installment.id}`} className="text-sm font-medium">
                          결제 조건
                        </Label>
                        <Input
                          id={`description-${installment.id}`}
                          value={installment.description}
                          onChange={(e) => updateInstallment(installment.id, 'description', e.target.value)}
                          placeholder="결제 조건 (예: 디자인 완료 후)"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* 총합 표시 */}
              <Alert variant={getAlertVariant()} className="border-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">총 비율:</span>
                    <Badge variant={totalPercentage === 100 ? 'default' : totalPercentage > 100 ? 'destructive' : 'secondary'} className="text-lg">
                      {totalPercentage}%
                    </Badge>
                  </div>
                  {totalPercentage !== 100 && (
                    <p className="mt-2 text-sm">
                      {totalPercentage > 100 
                        ? `${totalPercentage - 100}% 초과되었습니다.` 
                        : `${remainingPercentage}%가 부족합니다.`
                      }
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* 결제 요약 */}
        <Card>
          <CardHeader>
            <CardTitle>결제 요약</CardTitle>
            <CardDescription>설정된 결제 내역을 확인해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            {formData.paymentMethod === 'lump-sum' ? (
              <div className="flex justify-between items-center py-4">
                <span className="text-lg">총 결제금액:</span>
                <Badge variant="outline" className="text-xl font-bold">
                  {formatCurrency(totalAmount)}원
                </Badge>
              </div>
            ) : formData.paymentMethod === 'installment' ? (
              <div className="space-y-4">
                {installments.map((installment, index) => (
                  <div key={installment.id} className="space-y-2">
                    <div className="flex justify-between items-center py-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="font-bold bg-gray-200">{index + 1}</Badge>
                        <div>
                          <span className="font-medium font-bold">{installment.name}</span>
                          {installment.description && (
                            <p className="text-sm text-muted-foreground">{installment.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="font-bold border-none text-[16px]">
                        {formatCurrency(Math.round(totalAmount * installment.percentage / 100))}원
                      </Badge>
                    </div>
                    {index < installments.length - 1 && <Separator />}
                  </div>
                ))}
                <Separator className="my-4" />
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-semibold">총 결제금액:</span>
                  <Badge variant="outline" className="text-xl font-bold border-none">
                    {formatCurrency(totalAmount)}원
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                결제 방식을 선택해주세요
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return '프로젝트 기본 정보';
      case 2: return '수정 조건';
      case 3: return '결제 방식';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return '프로젝트의 기본 정보를 입력해주세요';
      case 2: return '수정 횟수와 관련 조건을 설정해주세요';
      case 3: return '결제 방식을 선택하고 최종 확인해주세요';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-2xl">프로젝트 생성</CardTitle>
                <CardDescription className="mt-2">
                  {getStepDescription()}
                </CardDescription>
              </div>
              <div className="text-sm text-gray-500">
                {currentStep} / {totalSteps}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>진행도</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-gray-200" />
            </div>

            {/* Step Indicator */}
            <div className="flex justify-between mt-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {currentStep > step ? <CheckCircle size={16} /> : step}
                  </div>
                  <span className={`ml-2 text-sm ${currentStep >= step ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                    {step === 1 ? '기본정보' : step === 2 ? '수정조건' : '결제방식'}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">{getStepTitle()}</h3>
              
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center cursor-pointer"
                >
                  <ChevronLeft size={16} className="mr-1" />
                  이전
                </Button>
              ) : (
                <div></div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="bg-gray-400 text-white border-gray-400 hover:bg-gray-500 hover:text-white cursor-pointer"
                >
                  임시저장
                </Button>
                {currentStep < totalSteps ? (
                  <Button
                    onClick={nextStep}
                    className="flex items-center text-white bg-black hover:bg-gray-700 cursor-pointer"
                  >
                    다음
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="flex items-center text-white bg-black hover:bg-gray-700 cursor-pointer"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    프로젝트 생성
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function CreateProjectPage() {
  return <MultiStepProjectForm />;
}
