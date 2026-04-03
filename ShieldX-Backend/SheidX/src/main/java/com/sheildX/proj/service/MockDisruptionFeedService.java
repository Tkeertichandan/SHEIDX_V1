package com.sheildX.proj.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;

import com.sheildX.proj.dto.AutomatedTriggerSignalDTO;
import com.sheildX.proj.model.TriggerEvent;

@Service
public class MockDisruptionFeedService {

    public List<AutomatedTriggerSignalDTO> generateSignalsForZones(List<String> zones) {
        List<AutomatedTriggerSignalDTO> signals = new ArrayList<>();

        for (String zone : zones) {
            double weatherProbability = random(0, 1);
            double platformProbability = random(0, 1);
            double regulatoryProbability = random(0, 1);

            if (weatherProbability > 0.72) {
                signals.add(new AutomatedTriggerSignalDTO(
                    TriggerEvent.TriggerType.WEATHER,
                    zone,
                    "Auto-feed: heavy rainfall and waterlogging risk",
                    random(0.7, 1.3)
                ));
            }

            if (platformProbability > 0.78) {
                signals.add(new AutomatedTriggerSignalDTO(
                    TriggerEvent.TriggerType.PLATFORM,
                    zone,
                    "Auto-feed: platform outage impacting dispatch flow",
                    random(0.6, 1.2)
                ));
            }

            if (regulatoryProbability > 0.82) {
                signals.add(new AutomatedTriggerSignalDTO(
                    TriggerEvent.TriggerType.REGULATORY,
                    zone,
                    "Auto-feed: temporary local delivery restriction",
                    random(0.5, 1.1)
                ));
            }
        }

        return signals;
    }

    private double random(double min, double max) {
        return ThreadLocalRandom.current().nextDouble(min, max);
    }
}
