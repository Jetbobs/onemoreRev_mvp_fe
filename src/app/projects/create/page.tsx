"use client"

import React, { useState } from 'react';
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

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
          onChange={(e) => handleInputChange('projectDescription', e.target.value)}
          onBlur={() => handleBlur('projectDescription')}
          rows={4}
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
          onChange={(e) => handleInputChange('revisionCriteria', e.target.value)}
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

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="paymentMethod" className="mb-2.5 block">결제 방식</Label>
        <Select
          value={formData.paymentMethod}
          onValueChange={(value) => {
            handleInputChange('paymentMethod', value);
            handleBlur('paymentMethod');
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="결제 방식을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="prepaid">일시불 (선불)</SelectItem>
            <SelectItem value="postpaid">일시불 (후불)</SelectItem>
            <SelectItem value="installment">분할 납부</SelectItem>
          </SelectContent>
        </Select>
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
      </div>

      {/* 선택된 결제 방식에 대한 요약 정보 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-4">프로젝트 요약</h3>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">프로젝트명:</span> {formData.projectName}</p>
          <p><span className="font-medium">비용:</span> {formData.budget ? `${parseInt(formData.budget).toLocaleString()}원` : ''}</p>
          <p><span className="font-medium">수정 횟수:</span> {formData.revisionCount}회</p>
          <p><span className="font-medium">추가 수정 요금:</span> {formData.additionalRevisionFee ? `${parseInt(formData.additionalRevisionFee).toLocaleString()}원` : ''}</p>
          <p><span className="font-medium">결제 방식:</span> {
            formData.paymentMethod === 'prepaid' ? '일시불 (선불)' :
            formData.paymentMethod === 'postpaid' ? '일시불 (후불)' :
            formData.paymentMethod === 'installment' ? '분할 납부' : ''
          }</p>
        </div>
      </div>
    </div>
  );

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
