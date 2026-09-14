const n=`{\r
 "cells": [\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "# 代码实现"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "我们将开始动手实现一个C3D模型并在UCF101数据集上进行训练和测试。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": 4,\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2023-04-11T07:31:04.787604Z",\r
     "iopub.status.busy": "2023-04-11T07:31:04.787213Z",\r
     "iopub.status.idle": "2023-04-11T07:31:04.950726Z",\r
     "shell.execute_reply": "2023-04-11T07:31:04.949574Z",\r
     "shell.execute_reply.started": "2023-04-11T07:31:04.787563Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "import torch.nn as nn\\n",\r
    "\\n",\r
    "class C3D(nn.Module):\\n",\r
    "    \\"\\"\\"\\n",\r
    "    C3D，Convolution 3D，即三维卷积\\n",\r
    "    \\"\\"\\"\\n",\r
    "\\n",\r
    "    def __init__(self):\\n",\r
    "        super(C3D, self).__init__()\\n",\r
    "        # 注意到核函数为三维，符合三维卷积的要求\\n",\r
    "        self.conv1 = nn.Conv3d(3, 64, kernel_size=(3, 3, 3), padding=(1, 1, 1))\\n",\r
    "        self.pool1 = nn.MaxPool3d(kernel_size=(1, 2, 2), stride=(1, 2, 2))\\n",\r
    "\\n",\r
    "        self.conv2 = nn.Conv3d(64, 128, kernel_size=(3, 3, 3), padding=(1, 1, 1))\\n",\r
    "        self.pool2 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))\\n",\r
    "\\n",\r
    "        self.conv3a = nn.Conv3d(128, 256, kernel_size=(3, 3, 3), padding=(1, 1, 1))\\n",\r
    "        self.conv3b = nn.Conv3d(256, 256, kernel_size=(3, 3, 3), padding=(1, 1, 1))\\n",\r
    "        self.pool3 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))\\n",\r
    "\\n",\r
    "        self.conv4a = nn.Conv3d(256, 512, kernel_size=(3, 3, 3), padding=(1, 1, 1))\\n",\r
    "        self.conv4b = nn.Conv3d(512, 512, kernel_size=(3, 3, 3), padding=(1, 1, 1))\\n",\r
    "        self.pool4 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2))\\n",\r
    "\\n",\r
    "        self.conv5a = nn.Conv3d(512, 512, kernel_size=(3, 3, 3), padding=(1, 1, 1))\\n",\r
    "        self.conv5b = nn.Conv3d(512, 512, kernel_size=(3, 3, 3), padding=(1, 1, 1))\\n",\r
    "        self.pool5 = nn.MaxPool3d(kernel_size=(2, 2, 2), stride=(2, 2, 2), padding=(0, 1, 1))\\n",\r
    "\\n",\r
    "        self.fc6 = nn.Linear(8192, 4096)\\n",\r
    "        self.fc7 = nn.Linear(4096, 4096)\\n",\r
    "        self.fc8 = nn.Linear(4096, 487)\\n",\r
    "\\n",\r
    "        self.dropout = nn.Dropout(p=0.5)\\n",\r
    "\\n",\r
    "        self.relu = nn.ReLU()\\n",\r
    "        self.softmax = nn.Softmax()\\n",\r
    "\\n",\r
    "    def forward(self, x):\\n",\r
    "\\n",\r
    "        h = self.relu(self.conv1(x))\\n",\r
    "        h = self.pool1(h)\\n",\r
    "\\n",\r
    "        h = self.relu(self.conv2(h))\\n",\r
    "        h = self.pool2(h)\\n",\r
    "\\n",\r
    "        h = self.relu(self.conv3a(h))\\n",\r
    "        h = self.relu(self.conv3b(h))\\n",\r
    "        h = self.pool3(h)\\n",\r
    "\\n",\r
    "        h = self.relu(self.conv4a(h))\\n",\r
    "        h = self.relu(self.conv4b(h))\\n",\r
    "        h = self.pool4(h)\\n",\r
    "\\n",\r
    "        h = self.relu(self.conv5a(h))\\n",\r
    "        h = self.relu(self.conv5b(h))\\n",\r
    "        h = self.pool5(h)\\n",\r
    "\\n",\r
    "        h = h.view(-1, 8192)\\n",\r
    "        h = self.relu(self.fc6(h))\\n",\r
    "        h = self.dropout(h)\\n",\r
    "        h = self.relu(self.fc7(h))\\n",\r
    "        h = self.dropout(h)\\n",\r
    "\\n",\r
    "        logits = self.fc8(h)\\n",\r
    "        probs = self.softmax(logits)\\n",\r
    "\\n",\r
    "        return probs"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "我们将基于C3D在UCF101数据集中实现视频动作识别。这里我们将直接调用已经完成的代码，你可以在GitHub链接中查看详细的项目。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": null,\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2023-04-11T07:31:04.953100Z",\r
     "iopub.status.busy": "2023-04-11T07:31:04.952673Z",\r
     "iopub.status.idle": "2023-04-11T07:31:05.229727Z",\r
     "shell.execute_reply": "2023-04-11T07:31:05.228024Z",\r
     "shell.execute_reply.started": "2023-04-11T07:31:04.953056Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "!git clone https://github.com/Niki173/C3D"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "在配置好UCF101数据集和模型预训练的权重之后，我们便可以进行C3D的训练。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": null,\r
   "metadata": {\r
    "execution": {\r
     "iopub.execute_input": "2023-04-11T07:31:05.231676Z",\r
     "iopub.status.busy": "2023-04-11T07:31:05.231267Z",\r
     "iopub.status.idle": "2023-04-11T07:31:05.497611Z",\r
     "shell.execute_reply": "2023-04-11T07:31:05.495635Z",\r
     "shell.execute_reply.started": "2023-04-11T07:31:05.231630Z"\r
    }\r
   },\r
   "outputs": [],\r
   "source": [\r
    "!python train.py"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "这里我们只展示部分训练流程。"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "\\n",\r
    "<center>\\n",\r
    "    <img style=\\"border-radius: 0.3125em;\\" \\n",\r
    "    src=\\"https://pic4.zhimg.com/80/v2-bd336d8be7e7f738db8e2ab5ae73005f_1440w.jpg\\" width=1000>\\n",\r
    "    <br>\\n",\r
    "    <div style=\\"color:orange; \\n",\r
    "    display: inline-block;\\n",\r
    "    color: #999;\\n",\r
    "    padding: 2px;\\"></div>\\n",\r
    "</center>"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "最后，我们在测试集上进行测试，准确率可达 96\\\\%。\\n",\r
    "\\n",\r
    "\\n",\r
    "<center>\\n",\r
    "    <img style=\\"border-radius: 0.3125em;\\" \\n",\r
    "    src=\\"https://pic3.zhimg.com/80/v2-6ef00350bc6f67a587ff4aca92e6f16e_1440w.jpg\\" width=1000>\\n",\r
    "    <br>\\n",\r
    "    <div style=\\"color:orange; \\n",\r
    "    display: inline-block;\\n",\r
    "    color: #999;\\n",\r
    "    padding: 2px;\\"></div>\\n",\r
    "</center>\\n",\r
    "\\n",\r
    "\\n",\r
    "<center>\\n",\r
    "    <img style=\\"border-radius: 0.3125em;\\" \\n",\r
    "    src=\\"https://pic4.zhimg.com/80/v2-70f46ed956b35461b3539053311877c7_1440w.jpg\\" width=600>\\n",\r
    "    <br>\\n",\r
    "    <div style=\\"color:orange; \\n",\r
    "    display: inline-block;\\n",\r
    "    color: #999;\\n",\r
    "    padding: 2px;\\"></div>\\n",\r
    "</center>"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "<!-- 目前的困难：\\n",\r
    "1. 姿态估计的精确度问题：由于人体姿态估计系统使用的是多种视觉信息，如果它们不能够准确地追踪到人体的每个部位，那么估计出来的结果也会不准确。\\n",\r
    "1. 尺度不变性问题：尽管现有的人体姿态估计算法可以处理不同尺度的图像，但它们仍然存在尺度不变性问题，即当姿态发生变化时，估计的结果可能会受到影响。\\n",\r
    "1. 光照变化问题：由于光照变化会对视觉信息产生影响，因此人体姿态估计系统可能无法准确地识别不同光照环境下的人体部位。\\n",\r
    "1. 复杂背景问题：复杂的背景可能会干扰人体姿态估计系统的性能，使得它无法准确地识别人体部位。 -->"\r
   ]\r
  }\r
 ],\r
 "metadata": {\r
  "kernelspec": {\r
   "display_name": "Python 3 (ipykernel)",\r
   "language": "python",\r
   "name": "python3"\r
  },\r
  "language_info": {\r
   "codemirror_mode": {\r
    "name": "ipython",\r
    "version": 3\r
   },\r
   "file_extension": ".py",\r
   "mimetype": "text/x-python",\r
   "name": "python",\r
   "nbconvert_exporter": "python",\r
   "pygments_lexer": "ipython3",\r
   "version": "3.8.16"\r
  }\r
 },\r
 "nbformat": 4,\r
 "nbformat_minor": 4\r
}\r
`;export{n as default};
