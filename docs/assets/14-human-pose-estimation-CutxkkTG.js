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
    "我们首先编写DeepPose的代码。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": null,\r
   "metadata": {},\r
   "outputs": [],\r
   "source": [\r
    "import torch\\n",\r
    "import torch.nn as nn\\n",\r
    "import torchvision.models as models\\n",\r
    "\\n",\r
    "class DeepPose(nn.Module):\\n",\r
    "    def __init__(self, num_keypoints=17, pretrained=True, num_stages=3):\\n",\r
    "        super(DeepPose, self).__init__()\\n",\r
    "        self.num_keypoints = num_keypoints\\n",\r
    "        self.num_stages = num_stages\\n",\r
    "\\n",\r
    "        # 加载预训练的ResNet模型用于特征提取\\n",\r
    "        self.backbone = models.resnet50(pretrained=pretrained)\\n",\r
    "        self.backbone = nn.Sequential(*list(self.backbone.children())[:-2])\\n",\r
    "\\n",\r
    "        # 为每个级联阶段定义回归层\\n",\r
    "        self.regression_layers = nn.ModuleList([\\n",\r
    "            self._make_regression_layer() for _ in range(num_stages)\\n",\r
    "        ])\\n",\r
    "\\n",\r
    "        # 每个级联阶段的最终全连接层，用于关节点预测\\n",\r
    "        self.fc_layers = nn.ModuleList([\\n",\r
    "            nn.Linear(2048, num_keypoints * 2) for _ in range(num_stages)\\n",\r
    "        ])\\n",\r
    "\\n",\r
    "    def _make_regression_layer(self):\\n",\r
    "        # 定义回归层，由几个卷积层组成\\n",\r
    "        return nn.Sequential(\\n",\r
    "            nn.Conv2d(2048, 512, kernel_size=3, padding=1),\\n",\r
    "            nn.BatchNorm2d(512),\\n",\r
    "            nn.ReLU(inplace=True),\\n",\r
    "            nn.Conv2d(512, 512, kernel_size=3, padding=1),\\n",\r
    "            nn.BatchNorm2d(512),\\n",\r
    "            nn.ReLU(inplace=True),\\n",\r
    "            nn.Conv2d(512, 2048, kernel_size=1)\\n",\r
    "        )\\n",\r
    "\\n",\r
    "    def forward(self, x):\\n",\r
    "        # 使用骨干网络提取特征\\n",\r
    "        features = self.backbone(x)\\n",\r
    "\\n",\r
    "        # 初始化关节点预测为零\\n",\r
    "        keypoint_preds = torch.zeros(x.size(0), self.num_keypoints * 2).to(x.device)\\n",\r
    "\\n",\r
    "        for i in range(self.num_stages):\\n",\r
    "            # 将关节点预测结果与特征图拼接\\n",\r
    "            keypoint_map = keypoint_preds.view(x.size(0), self.num_keypoints, 2, 1, 1)\\n",\r
    "            keypoint_map = keypoint_map.expand(-1, -1, -1, features.size(2), features.size(3))\\n",\r
    "            features_with_keypoints = torch.cat([features, keypoint_map.view(x.size(0), -1, features.size(2), features.size(3))], dim=1)\\n",\r
    "\\n",\r
    "            # 通过回归层进行细化\\n",\r
    "            regression_output = self.regression_layers[i](features_with_keypoints)\\n",\r
    "\\n",\r
    "            # 将回归输出展平并通过全连接层\\n",\r
    "            regression_output = regression_output.view(x.size(0), -1)\\n",\r
    "            keypoint_preds += self.fc_layers[i](regression_output)\\n",\r
    "\\n",\r
    "        # 返回关节点的最终位置\\n",\r
    "        return keypoint_preds.view(x.size(0), self.num_keypoints, 2)"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "接着，我们在COCO上对其进行训练。我们先导入必要的仓库以及库函数。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": null,\r
   "metadata": {},\r
   "outputs": [],\r
   "source": [\r
    "!git clone thttps://github.com/Naman-ntc/Pytorch-Human-Pose-Estimation.git\\n",\r
    "pip install -r requirements.txt"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "设置好模型设置和COCO数据集的路径，开始对模型进行训练。"\r
   ]\r
  },\r
  {\r
   "cell_type": "code",\r
   "execution_count": null,\r
   "metadata": {},\r
   "outputs": [],\r
   "source": [\r
    "!python main.py -DataConfig conf/datasets/coco.defconf -ModelConfig conf/models/DeepPose.defconf "\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "<div style=\\"display: inline-block; margin-top: 10px;\\">\\n",\r
    "        <img style=\\"border-radius: 0.3125em;\\" \\n",\r
    "        src=\\"https://pic3.zhimg.com/80/v2-4c76b584c3e5682a2153425c132f6b2e_1440w.webp\\" width=1000>\\n",\r
    "        <div style=\\"color:orange; \\n",\r
    "        display: block;\\n",\r
    "        color: #999;\\n",\r
    "        padding: 2px;\\"></div>\\n",\r
    "    </div>"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "由于训练输出较长，这里我们只展示开始训练的阶段。最后，我们在测试集上对模型进行测试，可发现最终的PCK可以达到57.5。"\r
   ]\r
  },\r
  {\r
   "cell_type": "markdown",\r
   "metadata": {},\r
   "source": [\r
    "<div style=\\"display: inline-block; margin-top: 10px;\\">\\n",\r
    "        <img style=\\"border-radius: 0.3125em;\\" \\n",\r
    "        src=\\"https://pic3.zhimg.com/80/v2-4b53bd3a8785cba4762d37f18fee0f32_1440w.jpg\\" width=1000>\\n",\r
    "        <div style=\\"color:orange; \\n",\r
    "        display: block;\\n",\r
    "        color: #999;\\n",\r
    "        padding: 2px;\\"></div>\\n",\r
    "    </div>"\r
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
   "version": "3.10.8"\r
  }\r
 },\r
 "nbformat": 4,\r
 "nbformat_minor": 4\r
}\r
`;export{n as default};
